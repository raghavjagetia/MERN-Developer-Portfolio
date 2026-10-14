import { useRef, useState } from 'react';
import { Flame, Snowflake, Sun, Table2, BarChart3 } from 'lucide-react';

const fmt = (v) => (Number.isInteger(v) ? v : v.toFixed(1));

function useTip() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const show = (e, content) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
  };
  const hide = () => setTip(null);
  const el = tip && <div className="tip" style={{ left: tip.x, top: tip.y }}>{tip.content}</div>;
  return { ref, show, hide, el };
}

// Card wrapper with chart/table toggle so data is never colour-only.
export function ChartCard({ title, sub, rows, cols = ['Item', 'Value'], children, className = '' }) {
  const [table, setTable] = useState(false);
  return (
    <div className={`card pad chart-card ${className}`}>
      <div className="row between">
        <div><h3>{title}</h3>{sub && <p className="muted small" style={{ margin: 0 }}>{sub}</p>}</div>
        {rows?.length > 0 && (
          <button className="icon-btn" onClick={() => setTable(!table)} aria-label={table ? 'Show chart' : 'Show table'} title={table ? 'Show chart' : 'Show table'}>
            {table ? <BarChart3 size={16} /> : <Table2 size={16} />}
          </button>
        )}
      </div>
      {table ? (
        <table className="data-table">
          <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.name}><td>{r.name}</td><td>{fmt(r.value)}</td></tr>)}</tbody>
        </table>
      ) : children}
    </div>
  );
}

export function Empty({ text = 'No data yet — browse the site or run a simulation.' }) {
  return <div className="empty-chart muted small">{text}</div>;
}

// Single-series horizontal bars (magnitude by item).
export function BarList({ items, unit = 'score' }) {
  const t = useTip();
  if (!items.length) return <Empty />;
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div className="barlist" ref={t.ref} onMouseLeave={t.hide}>
      {items.map((i) => (
        <div key={i.name} className="barlist-row" onMouseMove={(e) => t.show(e, <><b>{i.name}</b><span>{fmt(i.value)} {unit} · {Math.round((i.value / total) * 100)}%</span></>)}>
          <span className="barlist-label">{i.name}</span>
          <div className="barlist-track"><div className="barlist-fill" style={{ width: `${(i.value / max) * 100}%` }} /></div>
          <span className="barlist-val">{fmt(i.value)}</span>
        </div>
      ))}
      {t.el}
    </div>
  );
}

// Part-to-whole across a small, fixed set of categories. Colour follows the entity via `order`.
export function Donut({ items, order }) {
  const t = useTip();
  const [hover, setHover] = useState(null);
  if (!items.length) return <Empty />;
  const total = items.reduce((s, i) => s + i.value, 0);
  const R = 70, C = 2 * Math.PI * R, GAP = 3;
  let offset = 0;
  const slot = (name) => `var(--series-${(order.indexOf(name) % 8) + 1})`;
  const segs = items.map((i) => {
    const len = (i.value / total) * C;
    const s = { ...i, len, offset };
    offset += len;
    return s;
  });
  const shown = hover ? items.find((i) => i.name === hover) : null;

  return (
    <div className="donut-wrap" ref={t.ref} onMouseLeave={() => { t.hide(); setHover(null); }}>
      <svg viewBox="0 0 180 180" className="donut" role="img" aria-label="Preferred project categories">
        <circle cx="90" cy="90" r={R} fill="none" stroke="var(--grid)" strokeWidth="22" />
        {segs.map((s) => (
          <circle
            key={s.name}
            cx="90" cy="90" r={R} fill="none"
            stroke={slot(s.name)}
            strokeWidth={hover === s.name ? 28 : 22}
            strokeDasharray={`${Math.max(s.len - (items.length > 1 ? GAP : 0), 0.5)} ${C}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 90 90)"
            className="donut-seg"
            onMouseMove={(e) => { setHover(s.name); t.show(e, <><b>{s.name}</b><span>{fmt(s.value)} · {Math.round((s.value / total) * 100)}%</span></>); }}
          />
        ))}
        <text x="90" y="86" textAnchor="middle" className="donut-num">{shown ? `${Math.round((shown.value / total) * 100)}%` : items.length}</text>
        <text x="90" y="106" textAnchor="middle" className="donut-cap">{shown ? shown.name : 'categories'}</text>
      </svg>
      <ul className="legend">
        {items.map((i) => (
          <li key={i.name} onMouseEnter={() => setHover(i.name)} onMouseLeave={() => setHover(null)} className={hover && hover !== i.name ? 'dim' : ''}>
            <span className="swatch" style={{ background: slot(i.name) }} />
            <span>{i.name}</span>
            <b>{Math.round((i.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
      {t.el}
    </div>
  );
}

// Ordered funnel stages as columns (one hue), with stage-to-stage conversion in the tooltip.
export function Funnel({ stages }) {
  const t = useTip();
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="funnel" ref={t.ref} onMouseLeave={t.hide}>
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={s.name} className="funnel-col" onMouseMove={(e) => t.show(e, <><b>{s.name}</b><span>{s.value} events{conv !== null ? ` · ${conv}% of previous stage` : ''}</span></>)}>
            <b className="funnel-val">{s.value}</b>
            <div className="funnel-track"><div className="funnel-bar" style={{ height: `${Math.max(3, (s.value / max) * 100)}%` }} /></div>
            <span className="funnel-label">{s.name}</span>
          </div>
        );
      })}
      {t.el}
    </div>
  );
}

// Semicircle gauge for a 0–100 score; level carries an icon + label, never colour alone.
export function Gauge({ value, level }) {
  const R = 60, C = Math.PI * R;
  const meta = {
    Hot: { icon: Flame, cls: 'good', text: 'Very likely to reach out' },
    Warm: { icon: Sun, cls: 'warning', text: 'Showing real interest' },
    Cold: { icon: Snowflake, cls: 'neutral', text: 'Just browsing' },
  }[level];
  const Icon = meta.icon;
  return (
    <div className="gauge">
      <svg viewBox="0 0 150 86" role="img" aria-label={`Contact interest ${value} of 100, ${level}`}>
        <path d={`M15 78 A${R} ${R} 0 0 1 135 78`} fill="none" stroke="var(--grid)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M15 78 A${R} ${R} 0 0 1 135 78`} fill="none" className={`gauge-arc ${meta.cls}`} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(value / 100) * C} ${C}`} />
        <text x="75" y="72" textAnchor="middle" className="gauge-num">{value}</text>
      </svg>
      <div className={`status-pill ${meta.cls}`}><Icon size={14} /> {level}</div>
      <p className="muted small" style={{ margin: '6px 0 0' }}>{meta.text}</p>
    </div>
  );
}
