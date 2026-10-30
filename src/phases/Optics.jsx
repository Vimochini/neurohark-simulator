import { useEffect, useRef } from 'react';
import { ANALYTES, shiftFor } from '../sim.js';
import {
  QD_CENTER,
  benchPhysics,
  benchTransmission,
  detection,
  emissionSpectrum,
  spdRateSeries,
} from '../model/optics.js';
import { simulateSensor } from '../model/fluidics.js';
import { Caption, Chain, Panel, pointAlong, timeline } from '../ui.jsx';

const W = 1200;
const H = 780;
const INK = '#0b1220';
const NAVY = '#0b2a6f';
const BLUE = '#2f6fe0';
const PALE = '#e9f0fb';
const BOTTLE = '#cfe0f7';
const PURPLE = '#6a3fd0';
const VIOLET = '#5b2ca0';
const FONT = 'Arial, Helvetica, sans-serif';

const STAGES = [
  'Laser lights up QDs',
  'Glow circulates as WGM',
  'Target binds aptamers',
  'USB spectrometer',
  'SPD → ESP32 counts',
];
const DUR = [8, 10, 12, 10, 10];
const CAPTIONS = [
  'A 405 nm pulsed laser lights up the quantum dots in the polymer coating of the bottle resonator.',
  'The QD glow circulates around the bottle as whispering-gallery modes. Only resonant wavelengths survive: the transmission shows sharp dips.',
  'When the target binds the aptamers, the light changes slightly: the probed resonance shifts to longer wavelength.',
  'USB spectrometer measures the wavelength of the light. The transmission spectrum is read here.',
  'Single-photon detector counts individual photons, one electrical pulse each. The ESP32 counts the pulses: the count rate is the brightness of the glow.',
];

// ---- Model: nominal design, computed once ----
// Bottle: R 12.5 µm (25 µm bulge), QD coating, 60 nm fibre gap, bench loss and mode rules.
const PHYS = benchPhysics({ R_um: 12.5, H_um: 25, n: 1.46, lambda0: QD_CENTER, q: 1, gap: 60, loss: 15, mode: 'TE' });
const WIN = benchTransmission(PHYS, QD_CENTER, 0, 800);
// Comb tooth nearest the QD line: the mode the aptamer shift is read on.
const PROBE = PHYS.lambdaRes + Math.round((QD_CENTER - PHYS.lambdaRes) / PHYS.FSR) * PHYS.FSR;

const CONC = 100; // nM demonstration sample
const PLATEAU = shiftFor(CONC, 'dopamine');
const KIN_T = 60;
const KIN = simulateSensor({
  analyte: 'dopamine',
  inlet: (time) => (time >= 5 ? CONC : 0),
  tEnd: KIN_T,
  dt: 1,
  tr: { delay: 0, sigma: 0.5 },
});
const SPEC = emissionSpectrum({ diamUm: 25, q: 1e4, kappa2: 0.117, shift: PLATEAU, resolution: 0.4 });
const DET = detection({ nJ: 1, mhz: 50, od: 1, meanDetected: SPEC.meanDetected });
const BINS = spdRateSeries(DET.meas, 60, 0.1);

// Paths in canvas coordinates.
const BEAM = [[240, 210], [590, 210]];
const OUT_SPEC = [[808, 210], [880, 210], [948, 155]];
const OUT_SPD = [[808, 210], [880, 210], [948, 285]];

// ---- Drawing helpers ----
function label(ctx, str, x, y, { size = 17, color = INK, align = 'left', bg = true } = {}) {
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (bg) {
    const w = ctx.measureText(str).width;
    const pad = 6;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x0 - pad, y - size * 0.72, w + pad * 2, size * 1.44);
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x0 - pad, y - size * 0.72, w + pad * 2, size * 1.44);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function device(ctx, x, y, w, h, title, lines, active) {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = PALE;
  ctx.fill();
  ctx.lineWidth = active ? 5 : 2.5;
  ctx.strokeStyle = NAVY;
  if (active) {
    ctx.shadowColor = BLUE;
    ctx.shadowBlur = 20;
  }
  ctx.stroke();
  ctx.restore();
  label(ctx, title, x + 14, y + 24, { size: 19, color: NAVY, bg: false });
  lines.forEach((l, i) => label(ctx, l, x + 14, y + 54 + i * 24, { size: 16, bg: false }));
}

function dot(ctx, x, y, color, r = 5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Bottle resonator (iso view as in the bench): body, end caps, QD coating shell.
function bottle(ctx, glow) {
  const cx = 700;
  const cy = 210;
  const rx = 112;
  const ry = 22;
  const hh = 44;
  ctx.save();
  if (glow) {
    ctx.shadowColor = PURPLE;
    ctx.shadowBlur = 24;
  }
  ctx.fillStyle = BOTTLE;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy + hh, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, cy - hh);
  ctx.ellipse(cx, cy - hh, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - hh, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f4f8fd';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = PURPLE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx + 8, ry + 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function orbitPoint(f) {
  const th = f * Math.PI * 2;
  return [700 + 104 * Math.cos(th), 210 + 17 * Math.sin(th)];
}

function axes(ctx, x0, y0, x1, y1) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0, y1);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

function drawScene(ctx, t) {
  const secs = t * 0.1;
  const tl = timeline(secs, DUR);
  const s = tl.index;
  const p = tl.progress;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Resonance shift on the probed mode: kinetic during binding, plateau afterwards.
  let shift = 0;
  if (s === 2) shift = KIN.shift[Math.min(KIN_T, Math.floor(p * KIN_T))];
  else if (s > 2) shift = PLATEAU;

  // ---- Devices ----
  device(ctx, 40, 150, 210, 128, '405 nm laser', ['pulsed, 50 MHz', '1 nJ per pulse', `${DET.photonsPerPulse.toExponential(1)} photons`], s === 0);
  device(ctx, 948, 84, 226, 128, 'USB spectrometer', ['400–700 nm', '0.4 nm resolution'], s === 3);
  device(ctx, 948, 240, 226, 128, 'SPD + ESP32', ['photon → pulse', `${(DET.meas / 1e3).toFixed(0)} kcps counted`], s === 4);

  // Fibre
  ctx.save();
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 210);
  ctx.lineTo(590, 210);
  ctx.moveTo(808, 210);
  ctx.lineTo(880, 210);
  ctx.lineTo(948, 148);
  ctx.moveTo(880, 210);
  ctx.lineTo(948, 300);
  ctx.stroke();
  ctx.restore();

  bottle(ctx, s >= 1);

  // Photons: pump beam into the fibre
  for (let i = 0; i < 8; i++) {
    const f = (secs * 0.22 + i / 8) % 1;
    if (f < 0.85) {
      const [x, y] = pointAlong(BEAM, f / 0.85);
      dot(ctx, x, y, VIOLET, 5);
    }
  }
  // Photons: QD glow circulating as WGM
  if (s >= 1) {
    for (let i = 0; i < 6; i++) {
      const [x, y] = orbitPoint((secs * 0.18 + i / 6) % 1);
      dot(ctx, x, y, PURPLE, 4.5);
    }
  }
  // Photons: out to spectrometer and SPD
  if (s >= 3) {
    for (let i = 0; i < 4; i++) {
      const [x, y] = pointAlong(OUT_SPEC, (secs * 0.3 + i / 4) % 1);
      dot(ctx, x, y, BLUE, 4.5);
    }
  }
  if (s >= 4) {
    for (let i = 0; i < 4; i++) {
      const [x, y] = pointAlong(OUT_SPD, (secs * 0.3 + i / 4) % 1);
      dot(ctx, x, y, NAVY, 4.5);
    }
  }

  // Annotations on the bottle (bench-style, bold and boxed)
  label(ctx, 'fibre gap 60 nm', 420, 150, { size: 16 });
  label(ctx, `probed mode ${(PROBE + shift).toFixed(2)} nm`, 700, 62, { size: 18, align: 'center' });
  label(ctx, `Δλ ${shift >= 0 ? '+' : ''}${shift.toFixed(3)} nm`, 700, 90, { size: 16, align: 'center' });
  label(ctx, 'QD 600 nm · pump 405 nm', 700, 130, { size: 15, align: 'center', color: PURPLE });
  label(ctx, `Q_L ${PHYS.QL.toExponential(2)} · FSR ${PHYS.FSR.toFixed(2)} nm`, 700, 324, { size: 16, align: 'center' });
  label(ctx, `${PHYS.regime} · m ${PHYS.m}`, 700, 352, { size: 16, align: 'center' });

  // ---- Transmission spectrum (bench model) ----
  const x0 = 96;
  const x1 = 580;
  const y0 = 690;
  const y1 = 440;
  const sxT = (l) => x0 + ((l - WIN.lo) / (WIN.hi - WIN.lo)) * (x1 - x0);
  const syT = (v) => y0 - v * (y0 - y1);
  label(ctx, 'Transmission spectrum (bench model)', 40, 410, { size: 19, color: NAVY, bg: false });
  axes(ctx, x0, y1, x1, y0);
  [0, 0.5, 1].forEach((v) => label(ctx, v.toFixed(1), x0 - 14, syT(v), { size: 15, align: 'right', bg: false }));
  [WIN.lo, QD_CENTER, WIN.hi].forEach((l) => label(ctx, l.toFixed(1), sxT(l), y0 + 24, { size: 15, align: 'center', bg: false }));
  label(ctx, 'wavelength (nm)', x1, y0 + 50, { size: 15, align: 'right', bg: false });

  const trace = (pts, dash, color, width) => {
    ctx.save();
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(([l, v], i) => (i ? ctx.lineTo(sxT(l), syT(v)) : ctx.moveTo(sxT(l), syT(v))));
    ctx.stroke();
    ctx.restore();
  };
  trace(WIN.pts, [7, 5], INK, 2);
  trace(benchTransmission(PHYS, QD_CENTER, shift, 800).pts, [], BLUE, 3.5);
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = PURPLE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sxT(QD_CENTER), y1);
  ctx.lineTo(sxT(QD_CENTER), y0);
  ctx.stroke();
  ctx.restore();
  label(ctx, 'QD 600 nm', sxT(QD_CENTER) + 6, y1 + 16, { size: 15, color: PURPLE });

  // ---- Binding response ----
  const bx0 = 660;
  const bx1 = 1150;
  const by0 = 560;
  const by1 = 450;
  const sxB = (i) => bx0 + (i / KIN_T) * (bx1 - bx0);
  const syB = (v) => by0 - (v / (PLATEAU * 1.25)) * (by0 - by1);
  label(ctx, `Binding response · dopamine ${CONC} nM`, 640, 420, { size: 19, color: NAVY, bg: false });
  axes(ctx, bx0, by1, bx1, by0);
  label(ctx, `${PLATEAU.toFixed(2)} nm`, bx0 - 14, syB(PLATEAU), { size: 15, align: 'right', bg: false });
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#8a95a8';
  ctx.beginPath();
  ctx.moveTo(bx0, syB(PLATEAU));
  ctx.lineTo(bx1, syB(PLATEAU));
  ctx.stroke();
  ctx.restore();
  const vis = s < 2 ? 0 : s === 2 ? Math.floor(p * KIN_T) : KIN_T;
  if (vis > 0) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= vis; i++) {
      if (i) ctx.lineTo(sxB(i), syB(KIN.shift[i]));
      else ctx.moveTo(sxB(i), syB(KIN.shift[i]));
    }
    ctx.strokeStyle = ANALYTES.dopamine.color;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }
  label(ctx, '0 s', bx0, by0 + 24, { size: 15, bg: false });
  label(ctx, `${KIN_T} s`, bx1, by0 + 24, { size: 15, align: 'right', bg: false });

  // ---- SPD counts ----
  const cx0 = 660;
  const cx1 = 1150;
  const cy0 = 735;
  const cy1 = 640;
  const maxRate = DET.meas * 1.15;
  label(ctx, 'SPD counts (0.1 s bins)', 640, 612, { size: 19, color: NAVY, bg: false });
  axes(ctx, cx0, cy1, cx1, cy0);
  label(ctx, `${(DET.meas / 1e3).toFixed(0)} kcps`, cx0 - 14, cy1, { size: 15, align: 'right', bg: false });
  const nBins = s < 4 ? 0 : s === 4 ? Math.floor(p * BINS.length) : BINS.length;
  if (nBins > 1) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < nBins; i++) {
      const x = cx0 + (i / (BINS.length - 1)) * (cx1 - cx0);
      const y = cy0 - (BINS[i] / maxRate) * (cy0 - cy1);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }
}

export default function Optics({ t }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, t);
  }, [t]);

  const s = timeline(t * 0.1, DUR).index;

  return (
    <div className="phase">
      <Chain stages={STAGES} active={s} />
      <Caption text={CAPTIONS[s]} />
      <Panel>
        <canvas
          ref={ref}
          className="sim-canvas"
          role="img"
          aria-label="Photonic simulation: QD bottle resonator, transmission spectrum, binding response and SPD counts"
        />
      </Panel>
    </div>
  );
}
