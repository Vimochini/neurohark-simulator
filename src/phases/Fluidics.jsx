import { ANALYTES } from '../sim.js';
import { CHIP_VOL_UL, transport, simulateSensor } from '../model/fluidics.js';
import { Defs, Adapter, Chip, Probe, SyringePump, Tube, WasteBottle } from '../art/Parts.jsx';
import { Caption, Chain, Panel, scaler, timeline, toPath } from '../ui.jsx';

// Nominal design (notes: aCSF 0.5–1 µL/min; tubing kept short).
const FLOW = 0.75; // µL/min
const TUBE_ID = 0.2; // mm (assumed)
const TUBE_LEN = 5; // cm (assumed)
const SAMPLE = ANALYTES.dopamine.color;
const INJ_AT = 30; // s, sample reaches the probe
const INJ_DUR = 120; // s
const INJ_C = 100; // nM

// Stages in the order of the handwritten notes (page 1).
const STAGES = ['Microdialysis probe', 'Syringe pump', 'PDMS chip', 'Bottle resonator'];
const DUR = [10, 10, 12, 14];
const CAPTIONS = [
  'Microdialysis probe collects fluid from brain tissue across its membrane.',
  'Syringe pump pushes the fluid through a tiny channel, delivering artificial cerebrospinal fluid at 0.5–1 µL/min.',
  'PDMS chip manipulates and controls tiny amounts of fluid. The sample front arrives at the resonator after the line delay.',
  'Bottle-shaped optical fibre resonator coated with quantum dots, aptamers that grab the target molecule, and an anti-fouling layer.',
];

// ---- Model (fixed nominal design, computed once) ----
const tr = transport({ flowUlMin: FLOW, tubeId: TUBE_ID, tubeLen: TUBE_LEN, tempC: 37 });
const tEnd = Math.ceil((INJ_AT + tr.delay + INJ_DUR + 120) / 60) * 60;
const ARR = simulateSensor({
  analyte: 'dopamine',
  inlet: (time) => (time >= INJ_AT && time < INJ_AT + INJ_DUR ? INJ_C : 0),
  tEnd,
  dt: 1,
  tr,
});
const sxT = scaler(0, tEnd, 50, 740);
const syC = scaler(0, INJ_C * 1.15, 210, 15);

// Tubing routes in illustration coordinates.
const PROBE_TO_PUMP = [[190, 204], [260, 204], [290, 150], [300, 98]];
const PUMP_TO_CHIP = [[622, 80], [640, 120], [640, 193], [658, 193]];
const CHIP_TO_WASTE = [[812, 193], [880, 193], [900, 134]];

export default function Fluidics({ t }) {
  const secs = t * 0.1;
  const tl = timeline(secs, DUR);
  const s = tl.index;
  const p = tl.progress;

  const visible = s < 2 ? 0 : s === 2 ? Math.floor(p * tEnd) : tEnd;
  const arrPts = ARR.cSens.slice(0, visible + 1).map((v, i) => [i, v]);
  const g = (stage) => (s === stage ? 'glow' : '');
  const flowT = secs * 0.06;

  return (
    <div className="phase">
      <Chain stages={STAGES} active={s} />
      <Caption text={CAPTIONS[s]} />

      <Panel>
        <svg viewBox="0 0 1000 380" className="art" role="img" aria-label="Microdialysis, syringe pump, PDMS chip and bottle resonator">
          <Defs />
          <rect x="10" y="60" width="190" height="250" rx="12" fill="url(#gTissue)" stroke="#d9a79a" strokeWidth="0.8" />
          <text x="105" y="335" textAnchor="middle" fontSize="19.5" fill="#8a4a3a">brain tissue</text>

          <g className={g(0)}>
            <Probe x={60} y={190} />
          </g>

          <Tube pts={PROBE_TO_PUMP} dots={s >= 1 ? 4 : 0} t={flowT} />

          <g className={g(1)}>
            <SyringePump x={330} y={40} display={[`${FLOW.toFixed(2)} µL/min`, s >= 1 ? 'RUN' : 'STANDBY']} on={s >= 1} />
          </g>

          <Tube pts={PUMP_TO_CHIP} dots={s >= 1 ? 6 : 0} t={flowT} dotColor={s >= 2 ? SAMPLE : '#9aa7b6'} />

          <g className={g(2)}>
            <Chip x={650} y={130} lit={s === 3} sample={s >= 2} />
          </g>

          <Tube pts={CHIP_TO_WASTE} dots={s >= 2 ? 4 : 0} t={flowT} dotColor={SAMPLE} />
          <WasteBottle x={880} y={134} />

          <text x="800" y="352" textAnchor="middle" fontSize="16.5" fill="#555">
            tubing {TUBE_ID} mm × {TUBE_LEN} cm · chip {CHIP_VOL_UL.toFixed(2)} µL · delay {tr.delay.toFixed(0)} s
          </text>
        </svg>
      </Panel>

      <Panel title="Sample arrival at the bottle resonator" tag={`${ANALYTES.dopamine.label} ${INJ_C} nM`}>
        <svg viewBox="0 0 760 240" className="chart">
          <line x1="50" y1="210" x2="740" y2="210" className="axis" />
          <line x1="50" y1="15" x2="50" y2="210" className="axis" />
          <line x1="50" x2="740" y1={syC(INJ_C)} y2={syC(INJ_C)} className="grid-line" />
          <text x="44" y={syC(INJ_C) + 4} textAnchor="end" className="lbl">{INJ_C} nM</text>
          <path d={toPath(arrPts, sxT, syC)} className="trace-live" stroke={SAMPLE} />
          <text x="50" y="226" className="lbl">0 s</text>
          <text x="740" y="226" textAnchor="end" className="lbl">{tEnd} s</text>
        </svg>
      </Panel>
    </div>
  );
}
