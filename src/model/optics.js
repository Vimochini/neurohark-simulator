// Optics model: bottle-shaped WGM resonator (all-pass ring), QD emission,
// cavity QED estimates, spectrometer resolution, SPD counting.
// Nominal design values. Values marked "assumed" are not from the project documents.

import { gauss } from '../sim.js';

export const PUMP_NM = 405; // nm, pulsed excitation (project spec)
export const QD_CENTER = 600; // nm, QD emission centre (assumed)
export const QD_SIGMA = 45; // nm, emission width (assumed)
export const N_GROUP = 1.46; // silica group index (approx.)
export const SILICA_DNDT = 1.0e-5; // 1/K, thermo-optic coefficient (assumed)
export const BG = 0.15; // off-resonance emission fraction (assumed)
export const DEAD_TIME = 50e-9; // s, SPD dead time (assumed)
export const DIPOLE = 2.6e-29; // C·m, QD exciton dipole (order of magnitude)

const H_PLANCK = 6.626e-34; // J·s
const C_LIGHT = 2.998e8; // m/s
const HBAR = 1.0546e-34; // J·s
const EPS0 = 8.854e-12; // F/m
const LAMBDA0 = QD_CENTER * 1e-9;
const FINE_STEP = 0.005; // nm, fine grid for resonance sampling
const N_FINE = Math.round(300 / FINE_STEP);

export const THERMAL_NM_PER_K = (QD_CENTER * SILICA_DNDT) / N_GROUP;
export const thermalShift = (tempC) => THERMAL_NM_PER_K * (tempC - 37);

const envelope = (l) => Math.exp(-0.5 * ((l - QD_CENTER) / QD_SIGMA) ** 2);

// Ring resonator from geometry and coupling.
//   a: single-pass amplitude (intrinsic loss), r: self-coupling, κ² = 1 − r².
//   Critical coupling when a = r. η_e: fraction of loss going into the fibre coupler.
export function resonator(diamUm, q, kappa2) {
  const L = Math.PI * diamUm * 1e-6;
  const alpha = (2 * Math.PI * N_GROUP) / (LAMBDA0 * q);
  const a = Math.exp((-alpha * L) / 2);
  const r = Math.sqrt(1 - kappa2);
  const fsr = (QD_CENTER * QD_CENTER) / (N_GROUP * Math.PI * diamUm * 1000);
  const fwhm =
    ((LAMBDA0 * LAMBDA0 * (1 - a * r)) / (Math.PI * N_GROUP * L * Math.sqrt(a * r))) * 1e9;
  const etaE = kappa2 / (kappa2 + (1 - a * a));
  return {
    L,
    a,
    r,
    fsr,
    fwhm,
    finesse: fsr / fwhm,
    qLoaded: QD_CENTER / fwhm,
    qIntrinsic: q,
    coupling: a - r,
    etaE,
  };
}

// All-pass ring through-port power transmission.
// Resonance shift enters as a phase offset: φ = 2π·x·(1 + shift/λ), x = n·L/λ.
export function throughT(lambdaNm, res, shift) {
  const x = (N_GROUP * res.L) / (lambdaNm * 1e-9);
  const cosPhi = Math.cos(2 * Math.PI * x * (1 + shift / lambdaNm));
  const { a, r } = res;
  return (a * a + r * r - 2 * a * r * cosPhi) / (1 + a * a * r * r - 2 * a * r * cosPhi);
}

// Emission through the resonator, blurred by the spectrometer instrument function.
// Resonances appear as emission enhancement (1 − T). Returns:
//   trace: resolved spectrum, 0.5 nm grid; raw: unresolved, 0.1 nm grid;
//   meanDetected: mean emission above the 550 nm long-pass edge.
export function emissionSpectrum({ diamUm, q, kappa2, shift, resolution }) {
  const res = resonator(diamUm, q, kappa2);
  const fine = new Float64Array(N_FINE + 1);
  let detSum = 0;
  let detN = 0;
  for (let i = 0; i <= N_FINE; i++) {
    const l = 400 + i * FINE_STEP;
    const I = envelope(l) * (BG + (1 - BG) * (1 - throughT(l, res, shift)));
    fine[i] = I;
    if (l > 550) {
      detSum += I;
      detN++;
    }
  }

  const sig = Math.max(resolution / 2.3548, FINE_STEP);
  const half = Math.ceil((3 * sig) / FINE_STEP);
  const trace = [];
  for (let l = 400; l <= 700; l += 0.5) {
    const i0 = Math.round((l - 400) / FINE_STEP);
    let num = 0;
    let den = 0;
    for (let i = Math.max(0, i0 - half); i <= Math.min(N_FINE, i0 + half); i++) {
      const w = Math.exp(-0.5 * ((400 + i * FINE_STEP - l) / sig) ** 2);
      num += w * fine[i];
      den += w;
    }
    trace.push([l, den ? num / den : 0]);
  }

  const raw = [];
  for (let i = 0; i <= N_FINE; i += 20) raw.push([400 + i * FINE_STEP, fine[i]]);

  return { trace, raw, meanDetected: detSum / detN, res };
}

// Cavity QED estimates for the QD inside the mode volume.
//   V: mode volume (radial = evanescent decay length, axial = bottle length)
//   g: vacuum Rabi coupling, κ: cavity decay rate, F_P: Purcell factor.
export function cavityQED({ diamUm, q, kappa2, dSurfNm = 20, lenUm = 5 }) {
  const res = resonator(diamUm, q, kappa2);
  const Rm = (diamUm * 1e-6) / 2;
  const delta = LAMBDA0 / (2 * Math.PI * Math.sqrt(N_GROUP ** 2 - 1)); // m
  const V = 2 * Math.PI * Rm * delta * lenUm * 1e-6; // m³
  const omega = (2 * Math.PI * C_LIGHT) / LAMBDA0;
  const Evac = Math.sqrt((HBAR * omega) / (2 * EPS0 * N_GROUP ** 2 * V));
  const gMax = (DIPOLE * Evac) / HBAR; // rad/s
  const overlap = Math.exp((-2 * dSurfNm * 1e-9) / delta);
  const g = gMax * overlap;
  const kappa = C_LIGHT / (LAMBDA0 * res.qLoaded); // Hz (κ/2π)
  const Fp = (3 / (4 * Math.PI ** 2)) * (LAMBDA0 / N_GROUP) ** 3 * (res.qLoaded / V) * overlap;
  const gHz = g / (2 * Math.PI);
  return {
    V_um3: V * 1e18,
    delta_nm: delta * 1e9,
    g_MHz: gHz / 1e6,
    kappa_GHz: kappa / 1e9,
    Fp,
    overlap,
    etaE: res.etaE,
    regime: gHz < kappa / 4 ? 'Weak coupling (Purcell)' : 'Strong coupling',
  };
}

// Pulsed excitation and SPD count rates.
export function detection({ nJ, mhz, od, meanDetected }) {
  const photonsPerPulse = (nJ * 1e-9) / ((H_PLANCK * C_LIGHT) / (PUMP_NM * 1e-9));
  const raw = mhz * 1e6 * nJ * 10 ** -od * 0.5 * meanDetected; // cps (illustrative scale)
  const meas = raw / (1 + raw * DEAD_TIME);
  return { photonsPerPulse, raw, meas, deadFrac: raw * DEAD_TIME };
}

// Centroid precision of a resonance: σ ≈ W / (2·√N), N = counts in the resonance window
// during the integration time, combined in quadrature with a system noise floor.
export function spectralNoise({ fwhm, res, fsr, rate, tInt, sysNoise }) {
  const w = Math.sqrt(fwhm * fwhm + res * res);
  const share = Math.min(1, w / fsr);
  const N = Math.max(1, rate * tInt * share);
  const photon = w / (2 * Math.sqrt(N));
  return { sigma: Math.sqrt(photon * photon + sysNoise * sysNoise), photon, N, w };
}

// SPD count per bin (Poisson approximation), returns counts/s for each bin.
export function spdRateSeries(meanRate, n, binS = 0.1) {
  return Array.from({ length: n }, (_, i) => {
    const mean = meanRate * binS;
    const counts = Math.max(0, mean + Math.sqrt(mean) * gauss(i + 7));
    return counts / binS;
  });
}

// ---- WGM bench model (ported from the WGM bench reference, wgm-bench-clean) ----
// Resonance from the Airy-corrected mode number, Q budget from loss and fibre gap,
// transmission dip depth from coupling efficiency.
const AIRY = [2.3381, 4.0879, 5.5206, 6.7867, 7.9441];

export function benchPhysics({ R_um, H_um, n, lambda0, q = 1, gap, loss, mode = 'TE' }) {
  const R_nm = R_um * 1000;
  const H_nm = H_um * 1000;
  const nEff = mode === 'TE' ? n + 0.01 * (n - 1) : n - 0.018 * (n - 1);
  const nS = Math.max(nEff, 1.01);

  const x0 = (2 * Math.PI * R_nm * nS) / lambda0;
  const P = mode === 'TE' ? 1 : 1 / (nS * nS);
  const denomTerm = Math.sqrt(Math.max(nS * nS - 1, 0.05));
  const xCorr = x0 - AIRY[Math.min(q, 5) - 1] * Math.cbrt(Math.max(x0 / 2, 0.01)) + P / denomTerm;
  const m = Math.max(1, Math.round(xCorr));

  const L = 2 * Math.PI * R_nm * nS; // round-trip optical length, nm
  const lambdaRes = L / m;
  const FSR = (lambda0 * lambda0) / L;
  const lAxial = Math.max(1, Math.round((2 * H_nm * nS) / lambda0));

  const alpha = 0.02 * Math.pow(10, loss / 33.3); // cm⁻¹
  const Qi = (2 * Math.PI * nS) / (lambda0 * 1e-7 * alpha);
  const dEvan = lambda0 / (4 * Math.PI * Math.sqrt(Math.max(n * n - 1, 0.05))); // nm
  const eta = Math.exp(-gap / dEvan);
  const Qc = 6000 / Math.max(eta, 0.0004);
  const QL = 1 / (1 / Qi + 1 / Qc);
  const linewidth = lambda0 / QL; // nm
  const depth = Math.min(0.92, 0.25 + eta * 0.65);

  const ratio = Qc / Qi;
  let regime = 'critical';
  if (ratio > 1.3) regime = 'under-coupled';
  else if (ratio < 0.7) regime = 'over-coupled';

  return {
    lambdaRes,
    detuning: lambda0 - lambdaRes,
    FSR,
    linewidth,
    finesse: FSR / linewidth,
    Qi,
    Qc,
    QL,
    eta,
    depth,
    dEvan,
    lAxial,
    m,
    regime,
    nEff: nS,
  };
}

// Transmission window and sampled spectrum, same rule as the bench (span from FSR and linewidth).
// shift: resonance shift from binding (nm). Returns [λ, T] pairs.
export function benchTransmission(phys, lambda0, shift = 0, nPts = 800) {
  const span = Math.max(phys.FSR * 3.4, phys.linewidth * 14, 0.6);
  const lo = lambda0 - span / 2;
  const hi = lambda0 + span / 2;
  const res = phys.lambdaRes + shift;
  const halfw = phys.linewidth / 2 || 0.001;
  const pts = [];
  for (let i = 0; i <= nPts; i++) {
    const lam = lo + (i / nPts) * (hi - lo);
    const k = Math.round((lam - res) / phys.FSR);
    const peak = res + k * phys.FSR;
    const x = (lam - peak) / halfw;
    pts.push([lam, 1 - phys.depth / (1 + x * x)]);
  }
  return { pts, lo, hi };
}
