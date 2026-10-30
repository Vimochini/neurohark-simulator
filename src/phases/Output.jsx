import { shiftFor } from '../sim.js';
import { pumpStep } from '../model/fluidics.js';
import { detection, emissionSpectrum, spdRateSeries } from '../model/optics.js';
import { simulateThermal } from '../model/electronics.js';
import {
  Defs,
  ESP32,
  Laptop,
  LevelShifter,
  NEMA17,
  OLED,
  SPDModule,
  StepDriver,
  SyringePump,
  Wire,
} from '../art/Parts.jsx';
import { Caption, Chain, Panel, scaler, timeline } from '../ui.jsx';

const SETPOINT = 37;

// Stages in the order of the handwritten notes (pages 6–7).
const STAGES = [
  'SPD: photon → pulse',
  'Level shifter',
  'ESP32 pulse counter',
  'Stepper driver',
  'Motor presses syringe',
  'OLED display',
  'Firmware → USB / Wi-Fi',
];
const DUR = [8, 6, 8, 8, 8, 8, 10];
const CAPTIONS = [
  'Single-photon detector reacts to individual particles of light, firing one electrical pulse for each.',
  'If these pulses are 5 V or more, the level shifter lowers them to the 3.3 V level of the ESP32.',
  'ESP32 pulse counter tallies the pulses. This count rate is the brightness of the glow.',
  'To keep fluid moving, the ESP32 sends step-by-step commands to the stepper driver, which turns them into smooth motion.',
  'The motor presses the syringe pump, delivering artificial cerebrospinal fluid at a slow, steady 0.5–1 µL/min.',
  'OLED display shows the temperature, status and counts at a glance.',
  'Firmware packages everything with timestamps and sends it to the laptop by USB or Wi-Fi.',
];

// ---- Model (fixed nominal design) ----
const PLATEAU = shiftFor(100, 'dopamine');
const SPEC = emissionSpectrum({ diamUm: 25, q: 1e4, kappa2: 0.117, shift: PLATEAU, resolution: 0.4 });
const DET = detection({ nJ: 1, mhz: 50, od: 1, meanDetected: SPEC.meanDetected });
const BINS = spdRateSeries(DET.meas, 60, 0.1);
const pump = pumpStep(0.75, '100', 16);
const TRACE = simulateThermal(400, SETPOINT, 22);
const cur = TRACE[TRACE.length - 1];
const sxB = scaler(0, 59, 50, 740);
const syB = scaler(0, DET.meas * 1.15, 210, 15);

export default function Output({ t }) {
  const secs = t * 0.1;
  const tl = timeline(secs, DUR);
  const s = tl.index;
  const p = tl.progress;

  // SPD bins fill during the counter stage.
  const binCount = s < 2 ? 0 : s === 2 ? Math.floor(p * BINS.length) : BINS.length;
  const binPts = BINS.slice(0, binCount).map((v, i) => [sxB(i), syB(v)]);

  const g = (stages) => (stages.includes(s) ? 'glow' : '');
  const oledStatus = Math.abs(cur.err) > 0.05 ? (cur.err > 0 ? 'HEATING' : 'COOLING') : 'HOLD';
  const oledLines = [
    `T   ${cur.Tm.toFixed(2)} C`,
    `ST  ${oledStatus}`,
    `CNT ${(DET.meas / 1e3).toFixed(0)} kcps`,
  ];

  return (
    <div className="phase">
      <Chain stages={STAGES} active={s} />
      <Caption text={CAPTIONS[s]} />

      <Panel>
        <svg viewBox="0 0 1000 430" className="art" role="img" aria-label="Detection, stepper and display hardware">
          <Defs />

          <g className={g([0])}>
            <SPDModule x={20} y={56} on={s === 0} />
          </g>
          <g className={g([1])}>
            <LevelShifter x={220} y={70} on={s === 1} />
          </g>
          <g className={g([2])}>
            <ESP32 x={380} y={56} on={s === 2} label="ESP32" />
          </g>
          <g className={g([5])}>
            <OLED x={622} y={44} lines={oledLines} on={s === 5} />
          </g>
          <g className={g([3])}>
            <StepDriver x={380} y={200} on={s === 3} />
          </g>
          <g className={g([4])}>
            <NEMA17 x={500} y={190} on={s === 4} />
          </g>
          <g className={g([4])}>
            <SyringePump x={20} y={270} display={[`${(pump.stepsPerSec).toFixed(1)} /s`, s >= 4 ? 'RUN' : 'STANDBY']} on={s >= 4} />
          </g>
          <g className={g([6])}>
            <Laptop x={760} y={220} label="laptop" />
          </g>

          {/* SPD → level shifter → ESP32 */}
          <Wire pts={[[148, 92], [220, 100]]} color="#e67e22" width={1.6} />
          <Wire pts={[[312, 100], [380, 100]]} color="#2ecc71" width={1.6} />
          {/* I2C to OLED */}
          <Wire pts={[[530, 80], [622, 80]]} color="#2c7bd1" width={1.4} />
          <Wire pts={[[530, 92], [622, 92]]} color="#2c7bd1" width={1.4} />
          {/* step / dir / enable to driver */}
          <Wire pts={[[420, 128], [420, 170], [410, 170], [410, 200]]} color="#8e44ad" width={1.4} />
          <Wire pts={[[440, 128], [440, 176], [430, 176], [430, 200]]} color="#16a085" width={1.4} />
          {/* driver → motor coils */}
          <Wire pts={[[450, 220], [500, 222]]} color="#c0392b" width={1.4} />
          <Wire pts={[[450, 232], [500, 236]]} color="#2c3e50" width={1.4} />
          {/* lead screw to pump */}
          <Wire pts={[[500, 260], [330, 300], [300, 310]]} color="#7f8c8d" width={1.2} dash="5 4" />
          {/* USB to laptop */}
          <Wire pts={[[375, 92], [340, 150], [340, 360], [760, 360], [760, 300]]} color="#2c3e50" width={2} />
        </svg>
      </Panel>

      <Panel title="Count rate (ESP32 pulse counter, 0.1 s bins)" tag={`${(DET.meas / 1e3).toFixed(0)} kcps`}>
        <svg viewBox="0 0 760 230" className="chart">
          <line x1="50" y1="210" x2="740" y2="210" className="axis" />
          <line x1="50" y1="15" x2="50" y2="210" className="axis" />
          <text x="44" y="20" textAnchor="end" className="lbl">{(DET.meas / 1e3).toFixed(0)}k</text>
          <text x="44" y="213" textAnchor="end" className="lbl">0</text>
          {binPts.length > 1 && (
            <path d={`M${binPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')}`} className="trace-live" stroke="#2e9e5b" />
          )}
        </svg>
      </Panel>
    </div>
  );
}
