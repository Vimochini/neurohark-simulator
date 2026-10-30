// Shared utilities and analyte parameters for the NeuroHark simulator.
// Illustrative design-level values, not measurements.

export const ANALYTES = {
  dopamine: { label: 'Dopamine', color: '#e0457b', smax: 0.6, kd: 80 },
  glutamate: { label: 'Glutamate', color: '#2a9d8f', smax: 0.5, kd: 150 },
  gaba: { label: 'GABA', color: '#7c5cff', smax: 0.4, kd: 300 },
};

// Association rate, 1/(M·s) (assumed, same for all analytes).
export const KON = 1e6;

// Equilibrium resonance shift (nm), Langmuir coverage θ = C / (C + Kd).
export function shiftFor(concNm, analyte) {
  const { smax, kd } = ANALYTES[analyte];
  return (smax * concNm) / (concNm + kd);
}

// Binding relaxation time (s): τ = 1 / (kon·C + koff), reduces to 1000 / (C + Kd) in nM.
export function bindTau(concNm, analyte) {
  return 1000 / (concNm + ANALYTES[analyte].kd);
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Seeded PRNG (mulberry32), so every run looks the same.
export const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Deterministic hash in [0, 1), for per-sample noise.
export const hash = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Deterministic standard normal sample for index n.
export const gauss = (n) => {
  const u1 = Math.max(hash(2 * n + 1), 1e-9);
  const u2 = hash(2 * n + 2);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

// Least squares fit y = a + b x.
export function linFit(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const b = num / den;
  return { a: my - b * mx, b };
}
