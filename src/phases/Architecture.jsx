import { useState } from 'react';
import { Panel } from '../ui.jsx';

export default function Architecture() {
  const [full, setFull] = useState(false);

  return (
    <div className="phase">
      <Panel title="Overall system architecture">
        <div className="arch-bar">
          <button className="btn" onClick={() => setFull((f) => !f)}>
            {full ? 'Fit to width' : 'Full size'}
          </button>
          <a className="btn" href="/architecture.png" target="_blank" rel="noreferrer">
            Open image in new tab
          </a>
        </div>
        <div className={full ? 'arch-wrap full' : 'arch-wrap'}>
          <img src="/architecture.png" alt="NeuroHark integrated system architecture" className="arch-img" />
        </div>
        <p className="note">
          Optical path, fluidics, thermal control, main electronics and power, and software / ML
          stages, from the design diagram.
        </p>
      </Panel>
    </div>
  );
}
