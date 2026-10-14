import { useState } from 'react';
import { CheckCircle2, Copy, Download, Github, Linkedin, Mail, MapPin, Printer, Send, Twitter, Globe } from 'lucide-react';
import { certifications, education, experience, profile, skillGroups, faqs } from '../data/data.js';
import { Reveal } from '../components/Motion.jsx';
import { useTracker } from '../context/Tracker.jsx';
import { useUI } from '../context/UI.jsx';
import { copyText, downloadResume, printResume } from '../utils/resume.js';

const API = import.meta.env.VITE_API_URL || '';
const INQUIRY_TYPES = ['Full-time role', 'Freelance project', 'Collaboration', 'Consultation', 'Other'];
const MAX = 1000;
const socialIcons = { GitHub: Github, LinkedIn: Linkedin, 'Twitter / X': Twitter };
const empty = { name: '', email: '', type: INQUIRY_TYPES[1], message: '' };

function Resume() {
  return (
    <div className="resume" id="resume-doc">
      <header>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.role}</p>
        </div>
        <div className="resume-contact"><span>{profile.email}</span><span>{profile.location}</span></div>
      </header>
      <h4>Summary</h4>
      <p>{profile.summary}</p>
      <h4>Experience</h4>
      {experience.map((e) => (
        <div key={e.role} className="resume-item">
          <div className="row between"><strong>{e.role} · {e.org}</strong><span>{e.period}</span></div>
          <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      ))}
      <h4>Education</h4>
      {education.map((e) => <div key={e.role} className="row between"><strong>{e.role} · {e.org}</strong><span>{e.period}</span></div>)}
      <h4>Skills</h4>
      {skillGroups.map((g) => <p key={g.category}><strong>{g.category}:</strong> {g.skills.map((s) => s.name).join(' · ')}</p>)}
      <h4>Certifications</h4>
      {certifications.map((c) => <p key={c.credentialId}>{c.title} — {c.issuer} ({c.year})</p>)}
    </div>
  );
}

export default function ResumeContact() {
  const { track } = useTracker();
  const { toast } = useUI();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [started, setStarted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const set = (k, v) => {
    if (!started) { setStarted(true); track('contact_intent', 'form_started'); }
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please tell me your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'A few more words please (10+ characters).';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    track('contact_intent', 'form_submitted');
    try {
      const res = await fetch(`${API}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.status >= 400 && res.status < 500 && res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        setStatus('idle');
        return toast(data.error || 'Something went wrong.', '⚠️');
      }
      if (!res.ok) throw new Error('Server unavailable');
      setStatus('sent');
      setForm(empty);
    } catch {
      // Backend unavailable: fall back to the visitor's mail client so the inquiry is never lost.
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`${form.type} inquiry`)}&body=${body}`;
      setStatus('idle');
      toast('Opening your email app to send the inquiry…', '✉️');
    }
  };

  const copyEmail = async () => {
    track('contact_intent', 'copy_email');
    toast((await copyText(profile.email)) ? 'Email copied to clipboard' : profile.email, '📋');
  };

  return (
    <div className="container section">
      <Reveal className="page-head">
        <span className="eyebrow">Resume & Contact</span>
        <h1 className="display-sm">Let's <span className="grad">work together</span></h1>
        <p className="lead">Download my resume, check my credentials, or send me a message. I usually reply within 24 hours.</p>
      </Reveal>

      <div className="contact-layout">
        <Reveal className="contact-side">
          <div className="card pad avail-card">
            <span className={profile.available ? 'status on' : 'status'}><i /> {profile.available ? 'Available now' : 'Currently booked'}</span>
            <p style={{ margin: '12px 0 4px' }}><b>{profile.availability}</b></p>
            <p className="muted small row gap-sm"><MapPin size={14} /> {profile.location}</p>
            <button className="copy-row" onClick={copyEmail}>
              <Mail size={16} /> <span>{profile.email}</span> <Copy size={14} className="muted" />
            </button>
            <div className="social-grid">
              {profile.socials.map((s) => {
                const Icon = socialIcons[s.name] || Globe;
                return <a key={s.name} href={s.url} target="_blank" rel="noreferrer" onClick={() => track('contact_intent', s.name)}><Icon size={18} /> {s.name}</a>;
              })}
            </div>
          </div>

          <div className="card pad">
            <h3 style={{ marginTop: 0 }}>Resume</h3>
            <p className="muted small">Preview below, download a plain-text copy, or save as PDF from the print dialog.</p>
            <div className="row gap wrap">
              <button className="btn btn-sm" onClick={() => { track('resume_view', 'download'); downloadResume(); toast('Resume downloaded', '📄'); }}><Download size={16} /> Download</button>
              <button className="btn ghost btn-sm" onClick={() => { track('resume_view', 'print'); printResume(); }}><Printer size={16} /> Save as PDF</button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          {status === 'sent' ? (
            <div className="card pad success fade-in">
              <CheckCircle2 size={56} className="success-ico" />
              <h2>Message sent!</h2>
              <p className="muted">Thanks for reaching out — I'll get back to you within 24 hours.</p>
              <button className="btn" onClick={() => setStatus('idle')}>Send another</button>
            </div>
          ) : (
            <form className="card pad form" onSubmit={submit} noValidate>
              <h2 style={{ margin: 0 }}>Send an inquiry</h2>
              <fieldset className="pills">
                <legend className="muted small">What's this about?</legend>
                {INQUIRY_TYPES.map((t) => (
                  <label key={t} className={form.type === t ? 'pill on' : 'pill'}>
                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} />{t}
                  </label>
                ))}
              </fieldset>
              <div className="form-row">
                <div className={`field ${errors.name ? 'has-err' : ''}`}>
                  <input id="f-name" placeholder=" " value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
                  <label htmlFor="f-name">Your name</label>
                  {errors.name && <small className="err">{errors.name}</small>}
                </div>
                <div className={`field ${errors.email ? 'has-err' : ''}`}>
                  <input id="f-email" type="email" placeholder=" " value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
                  <label htmlFor="f-email">Email address</label>
                  {errors.email && <small className="err">{errors.email}</small>}
                </div>
              </div>
              <div className={`field ${errors.message ? 'has-err' : ''}`}>
                <textarea id="f-msg" rows={6} placeholder=" " maxLength={MAX} value={form.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} />
                <label htmlFor="f-msg">Tell me about your project</label>
                <div className="row between">
                  {errors.message ? <small className="err">{errors.message}</small> : <span />}
                  <small className="muted">{form.message.length}/{MAX}</small>
                </div>
              </div>
              <button className="btn btn-lg" disabled={status === 'loading'}>
                {status === 'loading' ? <><span className="spinner" /> Sending…</> : <><Send size={18} /> Send message</>}
              </button>
            </form>
          )}
        </Reveal>
      </div>

      <Reveal className="resume-wrap">
        <div className="row between wrap">
          <h2>Resume preview</h2>
          <span className="muted small">Live preview — always up to date</span>
        </div>
        <Resume />
      </Reveal>

      <div className="two-col" style={{ marginTop: 56 }}>
        <Reveal>
          <h2>Certifications</h2>
          <ul className="plain">
            {certifications.map((c) => (
              <li key={c.credentialId} className="card pad row between wrap"><span><strong>{c.title}</strong><br /><span className="muted small">{c.issuer}</span></span><span className="badge">{c.year}</span></li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <h2>FAQ</h2>
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
    </div>
  );
}
