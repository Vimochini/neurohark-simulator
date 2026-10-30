// Electronics model: NTC thermistor divider, ADS1115 quantisation, ESP32 PID,
// Peltier (TEC) thermal plant, power rails, firmware packets.
// Nominal design values. Values marked "assumed" are not from the project documents.

import { clamp, rng } from '../sim.js';

// Thermistor: 10 kΩ NTC, β model (assumed β and reference resistor).
export const R25 = 10000; // Ω
export const BETA = 3950; // K (assumed)
export const T25K = 298.15; // K
export const R_REF = 10000; // Ω, fixed reference in series (assumed value)
export const VS = 3.3; // V, divider supply (3.3 V rail)

// ADS1115: 16-bit, PGA ±4.096 V, 128 SPS (datasheet default rate).
export const ADC_BITS = 16;
export const ADC_FSR = 4.096; // V
export const ADC_LSB = (2 * ADC_FSR) / 2 ** ADC_BITS; // 125 µV
export const ADC_SPS = 128;

export const thermistorR = (tC) => R25 * Math.exp(BETA * (1 / (tC + 273.15) - 1 / T25K));

// Divider: thermistor to ground, reference to supply. V = Vs · Rt / (Rt + Rref).
export const dividerV = (tC) => {
  const Rt = thermistorR(tC);
  return (VS * Rt) / (Rt + R_REF);
};

export const adcCode = (V) => clamp(Math.round(V / ADC_LSB), 0, 2 ** (ADC_BITS - 1) - 1);

// Software inversion: code → V → Rt = Rref·V/(Vs−V) → T from β model.
export function tempFromCode(code) {
  const V = code * ADC_LSB;
  const Rt = (R_REF * V) / (VS - V);
  const invT = 1 / T25K + Math.log(Rt / R25) / BETA;
  return 1 / invT - 273.15;
}

// Temperature step per ADC LSB at a given temperature (°C per LSB).
export function tempResolution(tC) {
  const dV = (dividerV(tC + 0.01) - dividerV(tC - 0.01)) / 0.02;
  return ADC_LSB / Math.abs(dV);
}

// Peltier + chamber plant and ESP32 PID (assumed tuning).
export const TEC = { pMax: 4, cap: 1, gLoss: 0.25, iMax: 3 }; // W, J/K, W/K, A
export const PID = { Kp: 0.8, Ki: 0.5, Kd: 0.05, dt: 0.1 }; // dt in s

// Closed loop: ADC reading → PID → H-bridge drive u ∈ [−1, 1] → Peltier → chamber.
// Returns one sample per control step with the measured temperature and PID terms.
export function simulateThermal(n, setpoint = 37, ambient = 22) {
  const r = rng(7);
  const { Kp, Ki, Kd, dt } = PID;
  let T = ambient;
  let I = 0;
  let prevErr = 0;
  const out = [];
  for (let i = 0; i < n; i++) {
    const Tm = tempFromCode(adcCode(dividerV(T + (r() - 0.5) * 0.01)));
    const err = setpoint - Tm;
    I = clamp(I + err * dt, -5, 5);
    const D = (err - prevErr) / dt;
    prevErr = err;
    const pTerm = Kp * err;
    const iTerm = Ki * I;
    const dTerm = Kd * D;
    const u = clamp(pTerm + iTerm + dTerm, -1, 1);
    const P = u * TEC.pMax;
    T += (dt * (P - TEC.gLoss * (T - ambient))) / TEC.cap;
    out.push({ t: i * dt, T, Tm, err, u, P, I: u * TEC.iMax, pTerm, iTerm, dTerm });
  }
  return out;
}

// Power tree (budgets from the architecture diagram; loads assumed).
export const RAILS = [
  { name: '12 V input', src: 'Adapter', limit: 3, note: 'Adapter → 3 A fuse → main switch' },
  { name: '12 V rail', src: 'Adapter direct', limit: 2, note: 'Laser driver, pump driver, TEC H-bridge' },
  { name: '5 V rail', src: 'LM2596 buck', limit: 5, note: 'ESP32, OLED, SPD level shifter' },
  { name: '3.3 V rail', src: 'Low-noise LDO', limit: 0.5, note: 'ADS1115, spectrometer analog' },
];
export const BUCK = { vout: 5, fsw: 150e3, eff: 0.85 }; // LM2596 fixed 150 kHz (datasheet), η assumed
export const RIPPLE_PRE_MV = 50; // mV pp after buck (assumed)
export const FILTER_DB = 20; // LC/ceramic filter attenuation (assumed)
export const RIPPLE_POST_MV = RIPPLE_PRE_MV * 10 ** (-FILTER_DB / 20);

// One firmware record: sim time, measured temperature, count rate, step rate, TEC drive.
export function firmwarePacket(secs, s) {
  return `{"t":${secs.toFixed(1)},"T":${s.Tm.toFixed(2)},"cps":${Math.round(s.cps)},"step":${Math.round(s.stepHz)},"u":${s.u.toFixed(2)}}`;
}
