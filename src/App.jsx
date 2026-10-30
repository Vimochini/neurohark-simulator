import { useEffect, useState } from 'react';
import Fluidics from './phases/Fluidics.jsx';
import Optics from './phases/Optics.jsx';
import Power from './phases/Power.jsx';
import Output from './phases/Output.jsx';
import MachineLearning from './phases/MachineLearning.jsx';
import Architecture from './phases/Architecture.jsx';

// Phases follow the order of the handwritten process notes, then ML and the architecture diagram.
const PHASES = [
  { title: 'Fluidics', color: '#2f7fd1', Component: Fluidics },
  { title: 'Optics', color: '#7b4fd6', Component: Optics },
  { title: 'Power & Thermal', color: '#e0a526', Component: Power },
  { title: 'Detection & Output', color: '#c1652e', Component: Output },
  { title: 'Machine Learning', color: '#2e9e5b', Component: MachineLearning },
  { title: 'System Architecture', color: '#1b3a5c', Component: Architecture },
];

const SPEEDS = [0.5, 1, 2, 4];

export default function App() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setT((x) => x + 1), 70 / speed); // 70 ms per tick: ~1.4x faster than before
    return () => clearInterval(id);
  }, [running, speed]);

  const selectPhase = (i) => {
    setActive(i);
    setT(0);
  };

  const { title, color, Component } = PHASES[active];

  return (
    <div className="app">
      <header className="top">
        <h1>NeuroHark</h1>
      </header>

      <nav className="phases">
        {PHASES.map((p, i) => (
          <button
            key={p.title}
            className={i === active ? 'phase-btn active' : 'phase-btn'}
            style={{ '--accent': p.color }}
            onClick={() => selectPhase(i)}
          >
            <span className="num">{i + 1}</span>
            {p.title}
          </button>
        ))}
      </nav>

      <div className="controls">
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Play'}</button>
        <button onClick={() => setT(0)}>Restart sequence</button>
        <span className="speed-label">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={s === speed ? 'speed-btn active' : 'speed-btn'}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      <main className="stage" style={{ '--accent': color }}>
        <h2>
          <span className="num">{active + 1}</span> {title}
        </h2>
        <Component t={t} />
      </main>

      <footer className="foot">
        Simulation only. Nominal design values; assumed parameters are labelled. Based on the NeuroHark
        handwritten process notes, the project report and the architecture diagram.
      </footer>
    </div>
  );
}
