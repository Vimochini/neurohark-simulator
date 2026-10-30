// Shared display helpers. No inputs: the simulator runs fixed nominal designs.

export function Panel({ title, tag, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || tag) && (
        <header className="panel-head">
          <h3>{title}</h3>
          {tag && <span className="panel-tag">{tag}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, warn = false }) {
  return (
    <div className={warn ? 'stat warn' : 'stat'}>
      <span className="stat-label">{label}</span>
      <b className="stat-val">{value}</b>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

// Process chain: stages in order, the active one highlighted.
export function Chain({ stages, active }) {
  return (
    <ol className="chain">
      {stages.map((s, i) => (
        <li key={s} className={i < active ? 'done' : i === active ? 'current' : ''}>
          <span className="chain-idx">{String(i + 1).padStart(2, '0')}</span>
          <span className="chain-name">{s}</span>
        </li>
      ))}
    </ol>
  );
}

// Plain-language caption for the active stage.
export function Caption({ text }) {
  return <p className="caption">{text}</p>;
}

// Monospace formula block.
export function Eq({ children }) {
  return <pre className="eq">{children}</pre>;
}

// Linear map from data range [d0, d1] to pixel range [r0, r1].
export function scaler(d0, d1, r0, r1) {
  return (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

// Points [[x, y], ...] to an SVG path string.
export function toPath(pts, sx, sy) {
  return pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(' ');
}

// Point at fraction f (wraps 0..1) along a polyline.
export function pointAlong(pts, f) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(len);
    total += len;
  }
  let d = (((f % 1) + 1) % 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const k = d / segs[i];
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
}

// Stage position on a looping timeline. secs: elapsed seconds, durations: per stage.
export function timeline(secs, durations) {
  const total = durations.reduce((a, b) => a + b, 0);
  let x = ((secs % total) + total) % total;
  let index = 0;
  while (index < durations.length - 1 && x >= durations[index]) {
    x -= durations[index];
    index++;
  }
  return { index, progress: Math.min(1, x / durations[index]), local: x, total };
}
