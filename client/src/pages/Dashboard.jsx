import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Brain, Compass, Database, Eye, Lightbulb, Pause, Play, RefreshCw, RotateCcw, Target, Users, Zap } from 'lucide-react';
import { EVENT_TYPES, useTracker } from '../context/Tracker.jsx';
import { categories, projects } from '../data/data.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { BarList, ChartCard, Donut, Funnel, Gauge } from '../components/Charts.jsx';
import { Reveal } from '../components/Motion.jsx';
import { useUI } from '../context/UI.jsx';
import { api } from '../utils/api.js';

const FUNNEL = ['visit', 'project_view', 'tech_click', 'case_study', 'skill_explore', 'resume_view', 'contact_intent'];
const SHORT = { visit: 'Visit', project_view: 'Project view', tech_click: 'Tech click', case_study: 'Case study', skill_explore: 'Skill explore', resume_view: 'Resume', contact_intent: 'Contact' };

export default function Dashboard() {
  const { insights: x, events, simulate, simulateOne, reset } = useTracker();
  const { toast } = useUI();
  const [live, setLive] = useState(false);
  const [persona, setPersona] = useState('random');
  const [feedFilter, setFeedFilter] = useState('all');
  const [global, setGlobal] = useState(null);

  // Aggregated behaviour of every real visitor, stored by the backend.
  const loadGlobal = () => api('/api/events/summary').then(setGlobal).catch(() => setGlobal(false));
  useEffect(() => { loadGlobal(); }, []);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(simulateOne, 1200);
    return () => clearInterval(t);
  }, [live, simulateOne]);

  const nameOf = (id) => projects.find((p) => p.id === id)?.title || id;
  const frequent = Object.entries(x.projectViews).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, value]) => ({ name: nameOf(id), value }));
  const funnel = FUNNEL.map((t) => ({ name: SHORT[t], value: x.byType[t] || 0 }));
  const feed = [...events].reverse().filter((e) => feedFilter === 'all' || e.type === feedFilter).slice(0, 30);
  const engagedTypes = Object.keys(x.byType).length;

  const suggestions = [
    x.interests[0] && { icon: Lightbulb, text: <>Write more content about <b>{x.interests[0].name}</b> — it's the strongest interest signal.</> },
    x.categories[0] && { icon: Target, text: <>Add another <b>{x.categories[0].name}</b> case study to deepen proof of expertise.</> },
    x.contactScore >= 35 && { icon: Zap, text: <>High intent — show a "Hire me" call-to-action next to <b>{frequent[0]?.name || 'top projects'}</b>.</> },
    x.total > 0 && !x.byType.resume_view && { icon: Eye, text: <>Visitors haven't opened the resume — link it from case-study footers.</> },
    x.total > 0 && !x.byType.article_read && { icon: BookOpen, text: <>No articles read yet — surface related posts on project pages.</> },
  ].filter(Boolean);

  return (
    <div className="container section">
      <Reveal className="dash-head">
        <div>
          <span className="eyebrow"><Brain size={14} /> AI · Visitor behavior analysis</span>
          <h1 className="display-sm">Visitor insights <span className="grad">dashboard</span></h1>
          <p className="muted">Every interaction on this site is logged privately in your browser and analyzed in real time to personalize recommendations.</p>
        </div>
      </Reveal>

      <div className="toolbar card pad">
        <div className="row gap-sm wrap">
          <select className="select-sm" value={persona} onChange={(e) => setPersona(e.target.value)} aria-label="Simulated persona">
            <option value="random">Random persona</option>
            <option value="frontend">Frontend recruiter</option>
            <option value="backend">Backend tech lead</option>
            <option value="data">Data-focused client</option>
          </select>
          <button className="btn btn-sm" onClick={() => { simulate(persona); toast('Simulated a full visitor session', '🧪'); }}><Users size={16} /> Simulate session</button>
          <button className={live ? 'btn btn-sm live on' : 'btn ghost btn-sm live'} onClick={() => setLive(!live)} aria-pressed={live}>
            {live ? <><Pause size={16} /> Stop live</> : <><Play size={16} /> Live stream</>}
          </button>
        </div>
        <button className="btn ghost btn-sm danger" onClick={() => { setLive(false); reset(); toast('All tracked data cleared', '🧹'); }}><RotateCcw size={16} /> Reset</button>
      </div>

      <div className="kpis">
        <div className="card pad kpi"><span className="kpi-ico"><Activity size={18} /></span><span className="muted small">Total events</span><strong>{x.total}</strong><span className="muted small">{engagedTypes} interaction types</span></div>
        <div className="card pad kpi"><span className="kpi-ico"><Users size={18} /></span><span className="muted small">Visitor profile</span><strong className="kpi-text">{x.visitorType}</strong><span className="muted small">Inferred from behavior</span></div>
        <div className="card pad kpi"><span className="kpi-ico"><Compass size={18} /></span><span className="muted small">Deepest stage</span><strong className="kpi-text">{EVENT_TYPES[x.stage].label}</strong><span className="muted small">Furthest point in the journey</span></div>
        <div className="card pad kpi"><span className="muted small">Contact-interest indicator</span><Gauge value={x.contactScore} level={x.contactLevel} /></div>
      </div>

      <ChartCard title="Visitor journey funnel" sub="Portfolio visit → contact intent. Hover a stage for conversion." rows={funnel} cols={['Stage', 'Events']} className="mt">
        <Funnel stages={funnel} />
      </ChartCard>

      <div className="dash-grid">
        <ChartCard title="Technology interests" sub="Weighted by depth of interaction" rows={x.interests.slice(0, 8)} cols={['Technology', 'Score']}>
          <BarList items={x.interests.slice(0, 8)} />
        </ChartCard>
        <ChartCard title="Preferred project categories" sub="Share of project engagement" rows={x.categories} cols={['Category', 'Score']}>
          <Donut items={x.categories} order={categories} />
        </ChartCard>
        <ChartCard title="Frequently viewed projects" sub="Views + case-study reads" rows={frequent} cols={['Project', 'Views']}>
          <BarList items={frequent} unit="views" />
        </ChartCard>
        <ChartCard title="Most explored skills" sub="Skill cards opened" rows={x.skillsExplored.slice(0, 8)} cols={['Skill', 'Clicks']}>
          <BarList items={x.skillsExplored.slice(0, 8)} unit="clicks" />
        </ChartCard>
      </div>

      <section className="mt-lg">
        <div className="sec-head">
          <div>
            <span className="eyebrow"><Database size={14} /> Backend · {global ? (global.source === 'mongodb' ? 'MongoDB' : 'in-memory (no database configured)') : 'API'}</span>
            <h2>All visitors</h2>
            <p className="muted">Real (non-simulated) events from every visitor, aggregated by the Express API.</p>
          </div>
          <button className="btn ghost btn-sm" onClick={loadGlobal}><RefreshCw size={16} /> Refresh</button>
        </div>
        {global === null && <div className="card pad empty-chart muted">Loading…</div>}
        {global === false && <div className="card pad empty-chart muted">Couldn't reach /api/events/summary.</div>}
        {global && (
          <>
            <div className="kpis">
              <div className="card pad kpi"><span className="muted small">Events stored</span><strong>{global.total}</strong></div>
              <div className="card pad kpi"><span className="muted small">Unique sessions</span><strong>{global.sessions}</strong></div>
              <div className="card pad kpi"><span className="muted small">Resume views</span><strong>{global.byType.resume_view || 0}</strong></div>
              <div className="card pad kpi"><span className="muted small">Contact intents</span><strong>{global.byType.contact_intent || 0}</strong></div>
            </div>
            <div className="dash-grid">
              <ChartCard title="Most viewed projects" sub="All visitors" rows={global.topProjects.map((r) => ({ ...r, name: nameOf(r.name) }))} cols={['Project', 'Views']}>
                <BarList items={global.topProjects.map((r) => ({ ...r, name: nameOf(r.name) }))} unit="views" />
              </ChartCard>
              <ChartCard title="Top technologies & skills" sub="All visitors" rows={global.topTech} cols={['Technology', 'Clicks']}>
                <BarList items={global.topTech} unit="clicks" />
              </ChartCard>
            </div>
          </>
        )}
      </section>

      <section className="mt-lg">
        <div className="sec-head"><div><span className="eyebrow">Personalized</span><h2>Recommended projects</h2></div></div>
        {x.total ? (
          <div className="grid">
            {x.recommendations.slice(0, 3).map(({ project, matched, unseen }) => (
              <ProjectCard key={project.id} project={project} note={`${matched.length ? `Matches ${matched.slice(0, 3).join(', ')}` : 'Popular pick'}${unseen ? ' · new to you' : ''}`} />
            ))}
          </div>
        ) : <div className="card pad empty-chart muted">Interact with the portfolio or simulate a session to unlock recommendations.</div>}
      </section>

      <div className="two-col mt-lg">
        <div className="card pad">
          <h3>Suggested projects to explore</h3>
          <div className="suggest-list">
            {x.recommendations.filter((r) => r.unseen).slice(0, 4).map((r) => (
              <Link key={r.project.id} to={`/projects/${r.project.id}`} className="suggest">
                <span className="swatch-lg" style={{ background: `linear-gradient(135deg, ${r.project.color[0]}, ${r.project.color[1]})` }} />
                <span><b>{r.project.title}</b><br /><span className="muted small">{r.project.category}</span></span>
              </Link>
            ))}
            {!x.recommendations.some((r) => r.unseen) && <p className="muted">You've seen every project — impressive!</p>}
          </div>
        </div>
        <div className="card pad">
          <h3>Recommended technical articles</h3>
          <div className="suggest-list">
            {x.recommendedArticles.slice(0, 4).map(({ article, matched }) => (
              <Link key={article.id} to={`/blog/${article.id}`} className="suggest">
                <BookOpen size={20} className="muted" />
                <span><b>{article.title}</b><br /><span className="muted small">{matched.length ? `Because you explored ${matched.slice(0, 2).join(', ')}` : `${article.readTime} min read`}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col mt-lg">
        <div className="card pad">
          <h3><Lightbulb size={18} /> Suggested portfolio content</h3>
          {suggestions.length ? (
            <ul className="insight-list">{suggestions.map((s, i) => { const Icon = s.icon; return <li key={i}><Icon size={16} /> <span>{s.text}</span></li>; })}</ul>
          ) : <p className="muted">Waiting for data…</p>}
        </div>
        <div className="card pad">
          <div className="row between wrap">
            <h3><Activity size={18} /> Live event feed</h3>
            <select className="select-sm" value={feedFilter} onChange={(e) => setFeedFilter(e.target.value)} aria-label="Filter events">
              <option value="all">All events</option>
              {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="feed">
            {feed.length ? feed.map((e, i) => (
              <div key={`${e.ts}-${i}`} className="feed-row">
                <span className={`feed-dot t-${e.type}`} />
                <span className="feed-text">{EVENT_TYPES[e.type]?.label}{e.ref ? <span className="muted"> · {nameOf(e.ref)}</span> : null}{e.simulated && <span className="sim">sim</span>}</span>
                <span className="muted small">{new Date(e.ts).toLocaleTimeString()}</span>
              </div>
            )) : <p className="muted small">No events yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
