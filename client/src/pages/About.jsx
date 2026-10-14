import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Heart, Layers, Target, Users, BookOpen } from 'lucide-react';
import { faqs, funFacts, profile, skillGroups } from '../data/data.js';
import { Counter, Reveal, SectionHead, Spotlight } from '../components/Motion.jsx';

const values = [
  [Target, 'User-first', 'I design for real people, with accessibility and performance built in from day one.'],
  [Layers, 'Clean architecture', 'Readable, tested, maintainable code that teams can grow with confidence.'],
  [Users, 'Collaboration', 'Clear communication, honest estimates and frequent demos — no surprises.'],
  [BookOpen, 'Always learning', 'I ship side projects and write articles to keep sharpening my craft.'],
];

const story = [
  ['2016', 'Wrote my first line of JavaScript building a tool for my college club.'],
  ['2020', 'Graduated, finished a MERN bootcamp and landed my first developer role.'],
  ['2022', 'Shipped checkout systems used by 50k customers at BrightCart.'],
  ['2024', 'Leading a product team and mentoring 25+ new developers.'],
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <div className="container section">
      <div className="about-hero">
        <Reveal className="about-photo">
          <div className="photo-frame"><span>{profile.name.split(' ').map((w) => w[0]).join('')}</span></div>
          <div className="photo-badge"><Coffee size={16} /> Powered by coffee</div>
        </Reveal>
        <Reveal delay={100}>
          <span className="eyebrow">About me</span>
          <h1 className="display-sm">I'm {profile.name.split(' ')[0]} — a developer who loves <span className="grad">turning ideas into products.</span></h1>
          <p className="lead">{profile.summary}</p>
          <p className="muted">
            Outside of code I mentor new developers, contribute to open source and spend weekends hiking or playing chess.
            I believe the best software comes from curiosity, empathy for users and a relentless focus on quality.
          </p>
          <div className="row gap wrap">
            <Link to="/contact" className="btn">Let's talk <ArrowRight size={16} /></Link>
            <Link to="/experience" className="btn ghost">My journey</Link>
          </div>
        </Reveal>
      </div>

      <div className="stats mt-lg">
        {funFacts.map((f, i) => <Reveal key={f.label} delay={i * 80} className="stat"><strong><Counter value={f.value} /></strong><span>{f.label}</span></Reveal>)}
      </div>

      <SectionHead eyebrow="Story" title="How I got here" />
      <div className="story">
        {story.map(([y, t], i) => (
          <Reveal key={y} delay={i * 80} className="story-item"><span className="story-year grad">{y}</span><p>{t}</p></Reveal>
        ))}
      </div>

      <SectionHead eyebrow="Values" title="What I care about" />
      <div className="grid grid-4">
        {values.map(([Icon, t, d], i) => (
          <Reveal key={t} delay={i * 80}>
            <Spotlight className="card pad service"><span className="ico-box"><Icon size={22} /></span><h3>{t}</h3><p className="muted">{d}</p></Spotlight>
          </Reveal>
        ))}
      </div>

      <div className="two-col mt-lg">
        <Reveal>
          <h2>Daily toolkit</h2>
          <div className="card pad">
            {skillGroups.map((g) => (
              <div key={g.category} style={{ marginBottom: 12 }}>
                <span className="muted small">{g.category}</span>
                <div className="chips">{g.skills.map((s) => <span key={s.name} className="chip static">{s.name}</span>)}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h2>Frequently asked</h2>
          <div className="faq">
            {faqs.map((f, i) => (
              <div key={f.q} className={openFaq === i ? 'faq-item open' : 'faq-item'}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>{f.q}<span className="plus" /></button>
                <div className="collapse"><div><p className="muted">{f.a}</p></div></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal className="card pad cta-band mt-lg">
        <Heart size={28} />
        <h2>Thanks for stopping by!</h2>
        <p className="muted">Whether you have a project, a role or just want to say hi — my inbox is always open.</p>
        <Link to="/contact" className="btn">Get in touch</Link>
      </Reveal>
    </div>
  );
}
