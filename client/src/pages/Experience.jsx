import { useState } from 'react';
import { Briefcase, ChevronDown, GraduationCap } from 'lucide-react';
import { education, experience } from '../data/data.js';
import { Reveal } from '../components/Motion.jsx';

function Item({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = item.kind === 'work' ? Briefcase : GraduationCap;
  return (
    <Reveal as="li" className={`tl-item ${index % 2 ? 'right' : 'left'}`} delay={index * 60}>
      <span className="tl-dot"><Icon size={16} /></span>
      <div className="card pad tl-card">
        <button className="tl-head" onClick={() => setOpen(!open)} aria-expanded={open}>
          <div>
            <span className="badge">{item.period}</span>
            <h3>{item.role}</h3>
            <p className="muted" style={{ margin: 0 }}>{item.org}</p>
          </div>
          <ChevronDown size={20} className={open ? 'chev open' : 'chev'} />
        </button>
        <div className={open ? 'collapse open' : 'collapse'}>
          <div>
            <ul className="ticks">{item.points.map((p) => <li key={p}>{p}</li>)}</ul>
            {item.tech && <div className="chips">{item.tech.map((t) => <span key={t} className="chip static">{t}</span>)}</div>}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Experience() {
  const [filter, setFilter] = useState('all');
  const all = [...experience.map((e) => ({ ...e, kind: 'work' })), ...education.map((e) => ({ ...e, kind: 'edu' }))];
  const items = all.filter((i) => filter === 'all' || i.kind === filter);
  const years = new Date().getFullYear() - 2020;

  return (
    <div className="container section">
      <Reveal className="page-head center">
        <span className="eyebrow">Experience & Education</span>
        <h1 className="display-sm">My <span className="grad">journey</span> so far</h1>
        <p className="lead narrow mx-auto">{years}+ years of building products, leading teams and learning continuously.</p>
        <div className="seg seg-lg" role="group" aria-label="Filter timeline">
          {[['all', 'All'], ['work', 'Work'], ['edu', 'Education']].map(([k, l]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </Reveal>
      <ol className="timeline" key={filter}>
        {items.map((item, i) => <Item key={item.role + item.period} item={item} index={i} />)}
      </ol>
    </div>
  );
}
