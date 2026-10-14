import { useState } from 'react';
import { BadgeCheck, RotateCw } from 'lucide-react';
import { achievements, certifications } from '../data/data.js';
import { Counter, Reveal, SectionHead, Spotlight } from '../components/Motion.jsx';
import { useUI } from '../context/UI.jsx';
import { copyText } from '../utils/resume.js';

function CertCard({ c, delay }) {
  const [flipped, setFlipped] = useState(false);
  const { toast } = useUI();
  return (
    <Reveal delay={delay}>
      <div className={flipped ? 'flip flipped' : 'flip'}>
        <div className="flip-inner">
          <button className="flip-face card pad front" onClick={() => setFlipped(true)} aria-label={`${c.title} — show details`}>
            <span className="cert-seal"><BadgeCheck size={28} /></span>
            <h3>{c.title}</h3>
            <p className="muted">{c.issuer}</p>
            <span className="row between small" style={{ width: '100%' }}><span className="badge">{c.year}</span><span className="muted row gap-sm"><RotateCw size={13} /> Details</span></span>
          </button>
          <div className="flip-face card pad back" aria-hidden={!flipped}>
            <span className="muted small">Credential ID</span>
            <code className="cred">{c.credentialId}</code>
            <span className="muted small">Issued by {c.issuer} in {c.year}</span>
            <div className="row gap-sm wrap" style={{ marginTop: 'auto' }}>
              <button className="btn btn-sm" tabIndex={flipped ? 0 : -1} onClick={async () => toast((await copyText(c.credentialId)) ? 'Credential ID copied' : c.credentialId, '📋')}>Copy ID</button>
              <button className="btn ghost btn-sm" tabIndex={flipped ? 0 : -1} onClick={() => setFlipped(false)}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Certifications() {
  const [year, setYear] = useState('All');
  const years = ['All', ...[...new Set(certifications.map((c) => c.year))].sort((a, b) => b - a)];
  const list = certifications.filter((c) => year === 'All' || c.year === year);

  return (
    <div className="container section">
      <Reveal className="page-head">
        <span className="eyebrow">Certifications & Achievements</span>
        <h1 className="display-sm">Proof of <span className="grad">craft</span></h1>
        <p className="lead">Industry certifications and milestones I'm proud of. Tap a certificate to flip it.</p>
      </Reveal>

      <div className="stats">
        <div className="stat"><strong><Counter value={String(certifications.length)} /></strong><span>Certifications</span></div>
        <div className="stat"><strong><Counter value={String(achievements.length)} /></strong><span>Major achievements</span></div>
        <div className="stat"><strong><Counter value="120+" /></strong><span>Open-source PRs</span></div>
        <div className="stat"><strong><Counter value="40+" /></strong><span>Articles published</span></div>
      </div>

      <SectionHead eyebrow="Credentials" title="Certifications">
        <div className="seg" role="group" aria-label="Filter by year">
          {years.map((y) => <button key={y} className={year === y ? 'on' : ''} onClick={() => setYear(y)}>{y}</button>)}
        </div>
      </SectionHead>
      <div className="grid grid-4" key={year}>
        {list.map((c, i) => <CertCard key={c.credentialId} c={c} delay={i * 80} />)}
      </div>

      <SectionHead eyebrow="Milestones" title="Achievements" />
      <div className="grid">
        {achievements.map((a, i) => (
          <Reveal key={a.title} delay={i * 60}>
            <Spotlight className="card pad achievement"><div className="emoji">{a.icon}</div><div><h3>{a.title}</h3><p className="muted">{a.text}</p></div></Spotlight>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
