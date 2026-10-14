import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, ExternalLink, Github, User, X } from 'lucide-react';
import { projects } from '../data/data.js';
import { Thumb } from '../components/ProjectCard.jsx';
import { Counter, Reveal } from '../components/Motion.jsx';
import { useTracker } from '../context/Tracker.jsx';

const sections = [
  ['problem', 'Problem'],
  ['solution', 'Solution'],
  ['tech', 'Technologies'],
  ['process', 'Process'],
  ['features', 'Key features'],
  ['screens', 'Screenshots'],
  ['results', 'Results'],
];
const shots = ['Landing screen', 'Detail view', 'Admin dashboard'];

function Lightbox({ p, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onNav]);
  return (
    <div className="overlay lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={shots[index]}>
      <button className="icon-btn lb-close" onClick={onClose} aria-label="Close"><X size={22} /></button>
      <button className="icon-btn lb-prev" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Previous"><ChevronLeft size={26} /></button>
      <div className="lb-img shot" onClick={(e) => e.stopPropagation()} style={{ background: `linear-gradient(${135 + index * 40}deg, ${p.color[0]}, ${p.color[1]})` }}>
        <div className="shot-bar"><i /><i /><i /></div>
        <span>{shots[index]}</span>
      </div>
      <button className="icon-btn lb-next" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Next"><ChevronRight size={26} /></button>
      <p className="lb-cap">{index + 1} / {shots.length} · {shots[index]}</p>
    </div>
  );
}

export default function CaseStudy() {
  const { id } = useParams();
  const { track } = useTracker();
  const idx = projects.findIndex((p) => p.id === id);
  const p = projects[idx];
  const [activeSec, setActiveSec] = useState('problem');
  const [lb, setLb] = useState(null);

  // Count as a "read" only after the visitor stays a few seconds.
  useEffect(() => {
    if (!p) return;
    const t = setTimeout(() => track('case_study', p.id), 5000);
    return () => clearTimeout(t);
  }, [p, track]);

  // Scrollspy for the table of contents.
  useEffect(() => {
    const els = sections.map(([sid]) => document.getElementById(sid)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSec(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [id]);

  if (!p) {
    return (
      <div className="container section center">
        <h1>Project not found</h1>
        <Link to="/projects" className="btn">Back to projects</Link>
      </div>
    );
  }
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];
  const nav = (d) => setLb((i) => (i + d + shots.length) % shots.length);

  return (
    <div className="container section">
      <Link to="/projects" className="link"><ArrowLeft size={16} /> All projects</Link>

      <Reveal className="cs-hero">
        <div>
          <span className="badge">{p.category}</span>
          <h1 className="display-sm">{p.title}</h1>
          <p className="lead">{p.summary}</p>
          <div className="cs-meta">
            <div><User size={16} /><span className="muted small">Role</span><b>{p.role}</b></div>
            <div><Clock size={16} /><span className="muted small">Duration</span><b>{p.duration}</b></div>
            <div><CalendarDays size={16} /><span className="muted small">Year</span><b>{p.year}</b></div>
          </div>
          <div className="row gap wrap">
            <a className="btn" href={p.links.live} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Live demo</a>
            <a className="btn ghost" href={p.links.repo} target="_blank" rel="noreferrer"><Github size={16} /> Source code</a>
          </div>
        </div>
        <Thumb project={p} big />
      </Reveal>

      <div className="cs-layout">
        <aside className="toc" aria-label="On this page">
          <span className="eyebrow">On this page</span>
          {sections.map(([sid, label]) => (
            <a key={sid} href={`#${sid}`} className={activeSec === sid ? 'on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(sid)?.scrollIntoView({ behavior: 'smooth' }); }}>{label}</a>
          ))}
        </aside>

        <div className="cs-body">
          <Reveal as="section" id="problem" className="cs-sec">
            <span className="eyebrow">01 · The problem</span>
            <h2>What needed solving</h2>
            <p className="lead">{p.problem}</p>
          </Reveal>
          <Reveal as="section" id="solution" className="cs-sec">
            <span className="eyebrow">02 · The solution</span>
            <h2>How I approached it</h2>
            <p className="lead">{p.solution}</p>
          </Reveal>
          <Reveal as="section" id="tech" className="cs-sec">
            <span className="eyebrow">03 · Technologies</span>
            <h2>Built with</h2>
            <div className="chips">
              {p.tech.map((t) => <Link key={t} to={`/projects?tech=${encodeURIComponent(t)}`} className="chip chip-lg" onClick={() => track('tech_click', t)}>{t}</Link>)}
            </div>
          </Reveal>
          <Reveal as="section" id="process" className="cs-sec">
            <span className="eyebrow">04 · Development process</span>
            <h2>Step by step</h2>
            <ol className="steps">{p.process.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}</ol>
          </Reveal>
          <Reveal as="section" id="features" className="cs-sec">
            <span className="eyebrow">05 · Key features</span>
            <h2>What it does</h2>
            <div className="feature-grid">{p.features.map((f) => <div key={f} className="feature"><CheckCircle2 size={18} /> {f}</div>)}</div>
          </Reveal>
          <Reveal as="section" id="screens" className="cs-sec">
            <span className="eyebrow">06 · Screenshots</span>
            <h2>A look inside</h2>
            <div className="shots">
              {shots.map((s, i) => (
                <button key={s} className="shot" onClick={() => setLb(i)} aria-label={`Open ${s}`} style={{ background: `linear-gradient(${135 + i * 40}deg, ${p.color[0]}, ${p.color[1]})` }}>
                  <div className="shot-bar"><i /><i /><i /></div>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal as="section" id="results" className="cs-sec">
            <span className="eyebrow">07 · Results</span>
            <h2>The impact</h2>
            <div className="stats">{p.results.map((r) => <div key={r.label} className="stat"><strong><Counter value={r.value} /></strong><span>{r.label}</span></div>)}</div>
          </Reveal>

          <div className="cs-nav">
            <Link to={`/projects/${prev.id}`} className="card pad" onClick={() => track('project_view', prev.id)}>
              <span className="muted small"><ArrowLeft size={14} /> Previous</span><strong>{prev.title}</strong>
            </Link>
            <Link to={`/projects/${next.id}`} className="card pad right" onClick={() => track('project_view', next.id)}>
              <span className="muted small">Next <ArrowRight size={14} /></span><strong>{next.title}</strong>
            </Link>
          </div>
        </div>
      </div>

      {lb !== null && <Lightbox p={p} index={lb} onClose={() => setLb(null)} onNav={nav} />}
    </div>
  );
}
