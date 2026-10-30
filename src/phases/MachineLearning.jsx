import { ANALYTES, linFit, rng, shiftFor } from '../sim.js';
import { Panel, scaler } from '../ui.jsx';

const STAGES = [
  ['Acquire', 'Spectrum, counts, temperature, flow'],
  ['Preprocess', 'Outlier removal, baseline correction, flow-delay alignment'],
  ['Features', 'Peak shift, count rate and its change, temperature'],
  ['Model', 'Linear regression baseline (Random Forest / NN later)'],
  ['Display', 'Concentration and confidence on laptop'],
];
const STAGE_TICKS = 15;

// Synthetic bench runs: concentrations 1 nM to 1 µM (log-uniform), noisy shifts.
const DATA = (() => {
  const r = rng(42);
  return Array.from({ length: 40 }, (_, i) => {
    const conc = Math.round(10 ** (r() * 3));
    const shift = shiftFor(conc, 'dopamine') + (r() - 0.5) * 0.02;
    return { conc, shift, day: (i % 3) + 1 };
  });
})();

const TRAIN = DATA.slice(0, 28);
const TEST = DATA.slice(28);
const FIT = linFit(
  TRAIN.map((d) => d.shift),
  TRAIN.map((d) => Math.log10(d.conc)),
);
const predict = (shift) => 10 ** (FIT.a + FIT.b * shift);

const TEST_ROWS = TEST.map((d) => ({ ...d, pred: predict(d.shift) }));
const MAE = TEST_ROWS.reduce((s, d) => s + Math.abs(d.pred - d.conc), 0) / TEST_ROWS.length;

const sx = scaler(0, 3, 50, 330);
const sy = scaler(0, 3, 170, 15);

export default function MachineLearning({ t }) {
  const stage = Math.floor(t / STAGE_TICKS) % STAGES.length;
  const revealed = Math.min(TEST_ROWS.length, t % (TEST_ROWS.length + 8));

  return (
    <div className="phase">
      <Panel title="Pipeline (laptop)">
        <div className="pipeline">
          {STAGES.map(([name, desc], i) => (
            <div
              key={name}
              className={`stage-card ${i === stage ? 'current' : i < stage ? 'done' : ''}`}
            >
              <b>{name}</b>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid2">
        <Panel title="Predicted vs true concentration (log10 nM, test runs)">
          <svg viewBox="0 0 360 200" className="chart">
            <line x1="50" y1="170" x2="330" y2="170" className="axis" />
            <line x1="50" y1="15" x2="50" y2="170" className="axis" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(3)} y2={sy(3)} className="setpoint" />
            <text x="50" y="186" className="lbl">1 nM</text>
            <text x="330" y="186" textAnchor="end" className="lbl">1 µM</text>
            <text x="46" y="20" textAnchor="end" className="lbl">1 µM</text>
            {TRAIN.map((d, i) => (
              <circle
                key={`tr${i}`}
                cx={sx(Math.log10(d.conc))}
                cy={sy(Math.log10(d.conc))}
                r="3"
                className="pt-train"
              />
            ))}
            {TEST_ROWS.slice(0, revealed).map((d, i) => (
              <circle
                key={`te${i}`}
                cx={sx(Math.log10(d.conc))}
                cy={sy(Math.log10(Math.max(d.pred, 1)))}
                r="4"
                fill={ANALYTES.dopamine.color}
                className="pt-test"
              />
            ))}
          </svg>
          <p className="legend">Grey: training runs · Pink: held-out runs (predicted)</p>
        </Panel>

      </div>
    </div>
  );
}
