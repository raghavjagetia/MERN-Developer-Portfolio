import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import { profile } from '../data/data.js';
import { navLinks } from '../nav.js';
import { Reveal } from './Motion.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Reveal className="footer-cta">
          <div>
            <h2>Have a project in mind?</h2>
            <p className="muted">Let's turn your idea into a fast, beautiful product.</p>
          </div>
          <div className="row gap wrap">
            <Link to="/contact" className="btn">Start a conversation <ArrowUpRight size={16} /></Link>
            <a href={`mailto:${profile.email}`} className="btn ghost"><Mail size={16} /> {profile.email}</a>
          </div>
        </Reveal>
        <div className="footer-in">
          <div className="footer-brand">
            <Link to="/" className="logo"><span className="logo-mark">AM</span><span className="logo-text">{profile.name}</span></Link>
            <p className="muted small">{profile.tagline}</p>
            <span className={profile.available ? 'status on' : 'status'}><i /> {profile.available ? 'Available for work' : 'Currently booked'}</span>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            {navLinks.slice(0, 5).map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </div>
          <div className="footer-col">
            <h4>More</h4>
            {navLinks.slice(5).map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            {profile.socials.map((s) => <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name} <ArrowUpRight size={12} /></a>)}
          </div>
        </div>
        <div className="footer-bottom muted small">
          <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
          <span>Built with React, Node.js & MongoDB</span>
        </div>
      </div>
    </footer>
  );
}
