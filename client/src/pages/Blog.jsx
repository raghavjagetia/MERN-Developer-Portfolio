import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Heart, Search, X } from 'lucide-react';
import { articles } from '../data/data.js';
import { Reveal, Spotlight } from '../components/Motion.jsx';
import { useLikes } from '../utils/likes.js';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Blog() {
  const tags = useMemo(() => [...new Set(articles.flatMap((a) => a.tags))].sort(), []);
  const [tag, setTag] = useState('All');
  const [q, setQ] = useState('');
  const { liked, countOf } = useLikes();
  const [featured, ...rest] = articles;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return articles.filter((a) => (tag === 'All' || a.tags.includes(tag)) && (!s || `${a.title} ${a.excerpt} ${a.tags.join(' ')}`.toLowerCase().includes(s)));
  }, [tag, q]);
  const filtering = tag !== 'All' || q;

  return (
    <div className="container section">
      <Reveal className="page-head">
        <span className="eyebrow">Developer blog</span>
        <h1 className="display-sm">Notes on <span className="grad">building for the web</span></h1>
        <p className="lead">Practical articles on React, Node.js, MongoDB and shipping software.</p>
      </Reveal>

      {!filtering && (
        <Reveal>
          <Link to={`/blog/${featured.id}`} className="card featured-post">
            <div className="fp-art"><span>{featured.tags[0]}</span></div>
            <div className="pad">
              <span className="badge">Latest</span>
              <h2>{featured.title}</h2>
              <p className="muted">{featured.excerpt}</p>
              <span className="muted small row gap-sm"><Clock size={14} /> {featured.readTime} min · {fmtDate(featured.date)}</span>
              <span className="card-link">Read article <ArrowRight size={16} /></span>
            </div>
          </Link>
        </Reveal>
      )}

      <div className="filters card pad mt">
        <div className="search-box">
          <Search size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" aria-label="Search articles" />
          {q && <button className="icon-btn" onClick={() => setQ('')} aria-label="Clear"><X size={16} /></button>}
        </div>
        <div className="chips">
          {['All', ...tags].map((t) => <button key={t} className={tag === t ? 'chip active' : 'chip'} onClick={() => setTag(t)} aria-pressed={tag === t}>{t}</button>)}
        </div>
      </div>

      {(filtering ? list : rest).length ? (
        <div className="grid">
          {(filtering ? list : rest).map((a, i) => (
            <div key={a.id} className="pop-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Spotlight as={Link} to={`/blog/${a.id}`} className="card pad post-card">
                <span className="muted small row gap-sm"><Clock size={13} /> {a.readTime} min · {fmtDate(a.date)}</span>
                <h3>{a.title}</h3>
                <p className="muted">{a.excerpt}</p>
                <div className="row between">
                  <div className="chips">{a.tags.slice(0, 2).map((t) => <span key={t} className="chip static">{t}</span>)}</div>
                  <span className="muted small row gap-sm"><Heart size={14} className={liked[a.id] ? 'liked' : ''} /> {countOf(a)}</span>
                </div>
              </Spotlight>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty card pad center"><h3>No articles found</h3><button className="btn btn-sm" onClick={() => { setQ(''); setTag('All'); }}>Reset</button></div>
      )}
    </div>
  );
}
