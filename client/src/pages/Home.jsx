import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Database, Download, Github, Layout, Linkedin, MapPin, Quote, Rocket, Server, Twitter } from 'lucide-react';
import { achievements, allTech, processSteps, profile, projects, roles, services, skillGroups, testimonials } from '../data/data.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { Counter, Reveal, SectionHead, Spotlight, Typewriter } from '../components/Motion.jsx';
import { useTracker } from '../context/Tracker.jsx';
import { useUI } from '../context/UI.jsx';
import { downloadResume } from '../utils/resume.js';

const serviceIcons = { Layout, Server, Database, Rocket };
const socialIcons = { GitHub: Github, LinkedIn: Linkedin, 'Twitter / X': Twitter };

function CodeCard() {
  return (
    <div className="code-card" aria-hidden="true">
      <div className="code-top"><i /><i /><i /><span>developer.js</span></div>
      <pre>
<span className="c-k">const</span> <span className="c-v">developer</span> = {'{'}{'\n'}
{'  '}name: <span className="c-s">'{profile.name}'</span>,{'\n'}
{'  '}role: <span className="c-s">'MERN Developer'</span>,{'\n'}
{'  '}stack: [<span className="c-s">'React'</span>, <span className="c-s">'Node'</span>, <span className="c-s">'Mongo'</span>],{'\n'}
{'  '}available: <span className="c-k">{String(profile.available)}</span>,{'\n'}
{'  '}<span className="c-f">build</span>(idea) {'{'}{'\n'}
{'    '}<span className="c-k">return</span> <span className="c-s">'🚀 shipped'</span>;{'\n'}
{'  '}{'}'},{'\n'}
{'}'};
      </pre>
      <span className="float-chip f1">⚛️ React</span>
      <span className="float-chip f2">🟢 Node.js</span>
      <span className="float-chip f3">🍃 MongoDB</span>
    </div>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = testimonials.length;
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);
  const t = testimonials[i];
  return (
    <div className="testimonial card" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Quote size={36} className="quote-ico" />
      <blockquote key={i} className="fade-in">“{t.quote}”</blockquote>
      <div className="row between wrap">
        <div className="row gap">
          <span className="avatar-sm">{t.name.split(' ').map((w) => w[0]).join('')}</span>
          <div><strong>{t.name}</strong><div className="muted small">{t.title}</div></div>
        </div>
        <div className="row gap-sm">
          <button className="icon-btn" aria-label="Previous testimonial" onClick={() => setI((i - 1 + n) % n)}><ChevronLeft size={18} /></button>
          <div className="dots">{testimonials.map((_, k) => <button key={k} aria-label={`Testimonial ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
          <button className="icon-btn" aria-label="Next testimonial" onClick={() => setI((i + 1) % n)}><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { track } = useTracker();
  const { toast } = useUI();
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <section className="hero">
        <div className="container hero-in">
          <div className="hero-copy">
            <span className={profile.available ? 'status on' : 'status'}><i /> {profile.availability}</span>
            <h1 className="display">Hi, I'm <span className="grad">{profile.name.split(' ')[0]}</span>.<br />I build for the web.</h1>
            <p className="hero-role"><Typewriter words={roles} /></p>
            <p className="lead">{profile.tagline}</p>
            <div className="row gap wrap">
              <Link to="/projects" className="btn btn-lg">Explore my work <ArrowRight size={18} /></Link>
              <button className="btn ghost btn-lg" onClick={() => { track('resume_view', 'home'); downloadResume(); toast('Resume downloaded', '📄'); }}>
                <Download size={18} /> Resume
              </button>
            </div>
            <div className="hero-meta">
              <span className="muted small row gap-sm"><MapPin size={14} /> {profile.location}</span>
              <div className="row gap-sm">
                {profile.socials.map((s) => {
                  const Icon = socialIcons[s.name];
                  return Icon ? <a key={s.name} className="icon-btn" href={s.url} target="_blank" rel="noreferrer" aria-label={s.name}><Icon size={17} /></a> : null;
                })}
              </div>
            </div>
          </div>
          <CodeCard />
        </div>
      </section>

      <section className="marquee" aria-label="Technologies">
        <div className="marquee-track">
          {[...allTech, ...allTech].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </section>

      <section className="container section">
        <div className="stats">
          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="stat"><strong><Counter value={s.value} /></strong><span>{s.label}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHead eyebrow="What I do" title="Services built end-to-end" text={profile.summary} />
        <div className="grid grid-4">
          {services.map((s, i) => {
            const Icon = serviceIcons[s.icon];
            return (
              <Reveal key={s.title} delay={i * 80}>
                <Spotlight className="card pad service">
                  <span className="ico-box"><Icon size={22} /></span>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.text}</p>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container section">
        <SectionHead eyebrow="Selected work" title="Featured projects">
          <Link to="/projects" className="link">View all projects <ArrowRight size={16} /></Link>
        </SectionHead>
        <div className="grid">
          {featured.map((p, i) => <Reveal key={p.id} delay={i * 100}><ProjectCard project={p} /></Reveal>)}
        </div>
      </section>

      <section className="container section">
        <SectionHead eyebrow="Toolbox" title="Technology highlights" />
        <div className="grid grid-4">
          {skillGroups.map((g, i) => (
            <Reveal key={g.category} delay={i * 80}>
              <Spotlight className="card pad">
                <h3>{g.category}</h3>
                {g.skills.slice(0, 4).map((s) => (
                  <Link key={s.name} to="/projects" onClick={() => track('skill_explore', s.name)} className="mini-skill">
                    <span>{s.name}</span><span className="mini-bar"><i style={{ width: `${s.level}%` }} /></span>
                  </Link>
                ))}
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHead eyebrow="How I work" title="A simple, transparent process" />
        <div className="process">
          {processSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100} className="process-step">
              <span className="process-num">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionHead eyebrow="Kind words" title="What people say" />
        <Reveal><Testimonials /></Reveal>
      </section>

      <section className="container section">
        <SectionHead eyebrow="Milestones" title="Achievements">
          <Link to="/certifications" className="link">See all <ArrowRight size={16} /></Link>
        </SectionHead>
        <div className="grid">
          {achievements.slice(0, 3).map((a, i) => (
            <Reveal key={a.title} delay={i * 80}>
              <Spotlight className="card pad"><div className="emoji">{a.icon}</div><h3>{a.title}</h3><p className="muted">{a.text}</p></Spotlight>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
