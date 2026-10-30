// Fluidics model: syringe pump stepping, line hydraulics, Taylor-Aris dispersion,
// microdialysis recovery, stepper pulsation damping, sensor kinetics.
// Nominal design values. Values marked "assumed" are not from the project documents.

import { ANALYTES, KON } from '../sim.js';

export const D37 = 6e-10; // m²/s, small-molecule diffusion at 37 °C (assumed)
const P_ATM = 101325; // Pa

// Water-like dynamic viscosity (Pa·s), Vogel-type fit. 6.9e-4 at 37 °C.
export const viscosity = (tC) => 2.414e-5 * 10 ** (247.8 / (tC + 273.15 - 140));

// Stokes-Einstein scaling: D ∝ T / μ.
export const diffusivity = (tC) =>
  D37 * ((tC + 273.15) / 310.15) * (viscosity(37) / viscosity(tC));

// Syringe barrel inner diameter (mm). Assumed; check the datasheet.
export const SYRINGES = {
  100: { label: '100 µL', idMm: 3.26 },
  500: { label: '500 µL', idMm: 7.28 },
};
const LEAD_MM = 0.5; // leadscrew pitch (assumed)
const FULL_STEPS = 200; // 1.8° motor (assumed)
export const STEP_LIMIT = 20000; // steps/s, assumed driver limit

// Chip channel 100 µm × 80 µm × 10 mm (project spec: ~100 µm wide, 80 µm deep).
export const CHIP_W = 100e-6;
export const CHIP_H = 80e-6;
export const CHIP_L = 10e-3;
export const CHIP_VOL_UL = CHIP_W * CHIP_H * CHIP_L * 1e9; // µL

const flowSI = (flowUlMin) => (flowUlMin * 1e-9) / 60; // m³/s

// Volume per microstep (µL) and step rate (steps/s) for a flow.
export function pumpStep(flowUlMin, syringeKey, microstep) {
  const area = Math.PI * (SYRINGES[syringeKey].idMm / 2) ** 2; // mm²
  const ulPerStep = (area * LEAD_MM) / (FULL_STEPS * microstep); // µL
  return { ulPerStep, stepsPerSec: flowUlMin / 60 / ulPerStep };
}

// Hydraulic network: tubing (Hagen-Poiseuille) in series with chip (rectangular duct).
export function hydraulics({ flowUlMin, tubeId, tubeLen, tempC }) {
  const Q = flowSI(flowUlMin);
  const mu = viscosity(tempC);
  const r = (tubeId / 2) * 1e-3;
  const L = tubeLen * 1e-2;
  const dpTube = (8 * mu * L * Q) / (Math.PI * r ** 4);
  const Rchip = (12 * mu * CHIP_L) / (CHIP_W * CHIP_H ** 3 * (1 - (0.63 * CHIP_H) / CHIP_W));
  const dpChip = Rchip * Q;
  const dp = dpTube + dpChip;
  return { dp, dpTube, dpChip, Rtot: dp / Q, mu };
}

// Tubing volume (µL) = π r² L, with L in mm.
export const tubeVolume = (idMm, lengthCm) => Math.PI * (idMm / 2) ** 2 * lengthCm * 10;

// Microdialysis recovery E = 1 − exp(−k·L·(D/D37) / Q), k = 0.1 µL/min per mm (assumed).
export function recovery({ flowUlMin, probeMm, tempC }) {
  const k = 0.1 * probeMm * (diffusivity(tempC) / D37);
  return 1 - Math.exp(-k / flowUlMin);
}

// Taylor-Aris dispersion in a straight channel: transit time and temporal spread of a step.
function dispersion(Q, r, Lm, D) {
  const U = Q / (Math.PI * r * r); // mean velocity, m/s
  const Pe = (U * r) / D;
  const Deff = D * (1 + (Pe * Pe) / 48);
  const tt = Lm / U;
  return { tt, sigma: Math.sqrt(2 * Deff * tt) / U, Pe, Deff };
}

// Inlet-to-sensor transport: tubing + chip.
export function transport({ flowUlMin, tubeId, tubeLen, tempC }) {
  const Q = flowSI(flowUlMin);
  const D = diffusivity(tempC);
  const tube = dispersion(Q, (tubeId / 2) * 1e-3, tubeLen * 1e-2, D);
  const chipR = Math.sqrt((CHIP_W * CHIP_H) / Math.PI);
  const chip = dispersion(Q, chipR, CHIP_L, D);
  return {
    delay: tube.tt + chip.tt,
    sigma: Math.sqrt(tube.sigma ** 2 + chip.sigma ** 2),
    Pe: tube.Pe,
    dispRatio: tube.Deff / D,
  };
}

// Sensor response to an inlet concentration profile (nM).
//   1. Dispersion + delay: Gaussian-weighted average of the inlet profile.
//   2. Langmuir kinetics: dθ/dt = kon·C·(1 − θ) − koff·θ, solved exactly per step.
// Returns arrays on a dt grid: cSens (nM), shift (nm), theta (coverage).
export function simulateSensor({ analyte, inlet, tEnd, dt = 1, tr }) {
  const n = Math.round(tEnd / dt);
  const cIn = Array.from({ length: n + 1 }, (_, i) => inlet(i * dt));
  const half = Math.max(1, Math.ceil((4 * tr.sigma) / dt));
  const cSens = new Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const s = (i * dt - tr.delay) / dt;
    const c0 = Math.round(s);
    let num = 0;
    let den = 0;
    for (let j = Math.max(0, c0 - half); j <= Math.min(n, c0 + half); j++) {
      const w = Math.exp(-0.5 * (((j - s) * dt) / tr.sigma) ** 2);
      num += w * cIn[j];
      den += w;
    }
    cSens[i] = den ? num / den : cIn[Math.min(n, Math.max(0, c0))];
  }

  const { smax, kd } = ANALYTES[analyte];
  const kdis = kd * KON * 1e-9; // s⁻¹
  const shift = new Array(n + 1);
  const theta = new Array(n + 1);
  let th = cSens[0] / (cSens[0] + kd);
  for (let i = 0; i <= n; i++) {
    const ka = KON * cSens[i] * 1e-9;
    const k = ka + kdis;
    if (k > 0) {
      const eq = ka / k;
      th = eq + (th - eq) * Math.exp(-k * dt);
    }
    theta[i] = th;
    shift[i] = smax * th;
  }
  return { cSens, shift, theta };
}

// Stepper pulsation damped by line compliance (trapped air): first-order RC model.
export function pulsation({ flowUlMin, dp, bubbleUl, stepHz }) {
  const Q = flowSI(flowUlMin);
  const R = dp / Q;
  const C = (bubbleUl * 1e-9) / P_ATM;
  const tau = R * C;
  const damping = 1 / Math.sqrt(1 + (2 * Math.PI * stepHz * tau) ** 2);
  return { tau, damping };
}

// Pump flow (sawtooth, 50 % pulsation, assumed) and damped line flow over a window.
export function pulsationTrace({ flowUlMin, stepHz, tau, n = 240 }) {
  const T = Math.max(3 / stepHz, 0.2, 4 * tau);
  const dt = T / n;
  let out = flowUlMin;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i * dt;
    const phase = (t * stepHz) % 1;
    const pump = flowUlMin * (1 + 0.5 * (2 * phase - 1));
    if (tau > 0) out += (pump - out) * (1 - Math.exp(-dt / tau));
    else out = pump;
    pts.push([t / T, pump, out]);
  }
  return { pts, T };
}
