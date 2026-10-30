import { Caption, Chain, Panel, scaler, timeline, toPath } from '../ui.jsx';
import { simulateThermal } from '../model/electronics.js';
import {
  ADS1115,
  Adapter,
  BuckModule,
  Capacitor,
  Defs,
  ESP32,
  FuseHolder,
  HBridge,
  PeltierStack,
  ResistorRef,
  Thermistor,
  Wire,
} from '../art/Parts.jsx';

const SETPOINT = 37; // °C
const AMBIENT = 22; // °C

// Stages in the order of the handwritten notes (pages 3–5).
const STAGES = [
  '12 V adapter',
  'Fuse',
  'LM2596 buck',
  'Filter',
  '10 kΩ thermistor',
  'Reference resistor',
  'ADS1115 → I²C',
  'ESP32 PID loop',
  'H-bridge',
  'Peltier + heat sink fan',
  'Thermistor reports back',
];
const DUR = [5, 4, 6, 5, 6, 4, 8, 10, 6, 10, 4];
const CAPTIONS = [
  '12 V adapter is connected to the power supply.',
  'Fuse is there to prevent excess current (3 A).',
  'ESP32 cannot handle 12 V, so the LM2596 buck converter lowers it to 5 V.',
  'Filter smooths out the electrical ripples caused by the buck converter, while lowering the voltage or during load changes.',
  '10 kΩ thermistor: its resistance changes with every fluctuation of heat.',
  'Reference resistor: a fixed, known value, connected in series with the thermistor. Together they form a voltage divider.',
  'ADS1115 measures voltage, not resistance. Software calculates the thermistor resistance, converts it to temperature and sends it to the ESP32 on the I²C line.',
  'ESP32 runs a PID loop on the error value to see whether the chamber is too hot or too cold.',
  'H-bridge: a switch that can flip the direction of the current.',
  'Peltier module (TEC): current flows in and one side turns hot while the other turns cold, depending on the direction of the current. The aluminium plate touches the chamber; the heat sink fan blows unwanted heat away.',
  'The thermistor reports the temperature back, and the cycle repeats. The chamber is held at 37 °C.',
];

// ---- Model (fixed nominal design) ----
const N = 400;
const TRACE = simulateThermal(N, SETPOINT, AMBIENT); // 40 s of control at 0.1 s steps
const sxT = scaler(0, N - 1, 50, 740);
const syT = scaler(15, 42, 210, 15);

export default function Power({ t }) {
  const secs = t * 0.1;
  const tl = timeline(secs, DUR);
  const s = tl.index;
  const p = tl.progress;

  // Chamber state: ambient before the loop, sweeps during the PID stage, then holds.
  const idx = s < 7 ? 0 : s === 7 ? Math.floor(p * (N - 1)) : N - 1;
  const cur = TRACE[idx];
  const trPts = TRACE.slice(0, idx + 1).map((r, i) => [i, r.Tm]);
  const heating = cur.u >= 0;
  const g = (stages) => (stages.includes(s) ? 'glow' : '');

  return (
    <div className="phase">
      <Chain stages={STAGES} active={s} />
      <Caption text={CAPTIONS[s]} />

      <Panel>
        <svg viewBox="0 0 1000 430" className="art" role="img" aria-label="Power, sensing and thermal control hardware">
          <Defs />

          {/* power chain */}
          <g className={g([0])}>
            <Adapter x={24} y={36} />
          </g>
          <g className={g([1])}>
            <FuseHolder x={196} y={50} />
          </g>
          <g className={g([2])}>
            <BuckModule x={300} y={36} on={s >= 2} />
          </g>
          <g className={g([3])}>
            <Capacitor x={452} y={40} label="filter" />
            <Capacitor x={482} y={40} label="filter" />
          </g>
          <ESP32 x={580} y={30} on={s >= 6} label="ESP32" />

          <Wire pts={[[136, 50], [196, 52]]} color="#c0392b" width={2.2} />
          <Wire pts={[[240, 56], [300, 56]]} color="#c0392b" width={2.2} />
          <Wire pts={[[400, 56], [452, 56]]} color="#e67e22" width={2.2} />
          <Wire pts={[[510, 56], [580, 46]]} color="#e67e22" width={2.2} />
          <Wire pts={[[120, 30], [120, 18], [700, 18], [700, 30]]} color="#333" width={1.4} dash="4 3" />

          {/* sensing */}
          <g className={g([5])}>
            <ResistorRef x={150} y={250} />
          </g>
          <g className={g([4, 10])}>
            <Thermistor x={60} y={236} />
          </g>
          <g className={g([6])}>
            <ADS1115 x={330} y={236} on={s >= 6} />
          </g>
          <Wire pts={[[66, 248], [40, 280], [150, 280], [150, 264]]} color="#7f8c8d" width={1.6} />
          <Wire pts={[[60, 264], [60, 292], [320, 292], [330, 270]]} color="#7f8c8d" width={1.4} />
          <Wire pts={[[414, 246], [414, 226], [600, 226], [600, 112]]} color="#2c7bd1" width={1.8} />
          <Wire pts={[[400, 246], [400, 220], [626, 220], [626, 112]]} color="#2c7bd1" width={1.8} />
          <Wire pts={[[360, 236], [360, 210], [320, 210], [320, 136], [330, 136]]} color="#7f8c8d" width={1.4} />
          <Wire pts={[[340, 236], [340, 205], [350, 205]]} color="#27ae60" width={1.2} />

          {/* actuation */}
          <g className={g([8])}>
            <HBridge x={600} y={262} on={s >= 8} />
          </g>
          <Wire pts={[[708, 262], [708, 240], [700, 240]]} color="#8e44ad" width={1.4} />
          <Wire pts={[[652, 262], [652, 110]]} color="#f39c12" width={1.4} />
          <Wire pts={[[676, 262], [676, 110]]} color="#f39c12" width={1.4} />
          <Wire pts={[[620, 332], [620, 352], [770, 352], [770, 300]]} color="#c0392b" width={2.2} />
          <Wire pts={[[640, 332], [640, 342], [745, 342], [745, 296]]} color="#2c3e50" width={2.2} />

          <g className={g([9])}>
            <PeltierStack x={722} y={180} heating={heating} on={s >= 9} />
          </g>

          <text x="500" y="418" textAnchor="middle" fontSize="16.5" fill="#555">
            loop: thermistor → divider → ADS1115 → ESP32 PID → H-bridge → Peltier → chamber → thermistor
          </text>
        </svg>
      </Panel>

      <Panel title="Temperature control loop" tag={`setpoint ${SETPOINT} °C · measured`}>
        <svg viewBox="0 0 760 230" className="chart">
          <line x1="50" y1="210" x2="740" y2="210" className="axis" />
          <line x1="50" y1="15" x2="50" y2="210" className="axis" />
          <rect x="50" y={syT(SETPOINT + 0.02)} width="690" height={Math.max(1, syT(SETPOINT - 0.02) - syT(SETPOINT + 0.02))} className="band" />
          <line x1="50" x2="740" y1={syT(SETPOINT)} y2={syT(SETPOINT)} className="setpoint" />
          <text x="740" y={syT(SETPOINT) - 6} textAnchor="end" className="lbl">setpoint 37 °C · ±0.02 °C target</text>
          {[15, 25, 35].map((v) => (
            <text key={v} x="44" y={syT(v) + 4} textAnchor="end" className="lbl">{v}</text>
          ))}
          <path d={toPath(trPts, sxT, syT)} className="trace-live" stroke="#e0a526" />
          <circle cx={sxT(idx)} cy={syT(cur.Tm)} r="5" className="marker" />
        </svg>
      </Panel>
    </div>
  );
}
