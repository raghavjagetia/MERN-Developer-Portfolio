import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Heart, Link2, Sparkles } from 'lucide-react';
import { articles, profile } from '../data/data.js';
import { Reveal } from '../components/Motion.jsx';
import { useTracker } from '../context/Tracker.jsx';
import { useUI } from '../context/UI.jsx';
import { useLikes } from '../utils/likes.js';
import { copyText } from '../utils/resume.js';

export default function BlogPost() {
  const { id } = useParams();
  const { track, insights } = useTracker();
  const { toast } = useUI();
  const { liked: likedMap, toggle, countOf } = useLikes();
  const [progress, setProgress] = useState(0);
  const a = articles.find((x) => x.id === id);

  useEffect(() => {
    if (!a) return;
    const t = setTimeout(() => track('article_read', a.id), 4000);
    return () => clearTimeout(t);
  }, [a, track]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('article-body');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.5;
      setProgress(Math.max(0, Math.min(100, ((-r.top + window.innerHeight * 0.3) / Math.max(total, 1)) * 100)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [id]);

  if (!a) return <div className="container section center"><h1>Article not found</h1><Link to="/blog" className="btn">Back to blog</Link></div>;

  const related = articles.filter((x) => x.id !== a.id && x.tags.some((t) => a.tags.includes(t))).slice(0, 2);
  const forYou = insights.recommendedArticles.find((r) => r.article.id !== a.id && !related.includes(r.article))?.article;
  const liked = !!likedMap[a.id];

  return (
    <article className="container section narrow-page">
      <div className="read-progress" style={{ width: `${progress}%` }} />
      <Link to="/blog" className="link"><ArrowLeft size={16} /> All articles</Link>
      <Reveal className="post-head">
        <div className="chips">{a.tags.map((t) => <Link key={t} className="chip" to={`/projects?tech=${encodeURIComponent(t)}`} onClick={() => track('tech_click', t)}>{t}</Link>)}</div>
        <h1 className="display-sm">{a.title}</h1>
        <div className="row between wrap">
          <div className="row gap">
            <span className="avatar-sm">{profile.name.split(' ').map((w) => w[0]).join('')}</span>
            <div><strong>{profile.name}</strong><div className="muted small row gap-sm"><Clock size={13} /> {a.readTime} min read · {new Date(a.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div></div>
          </div>
          <div className="row gap-sm">
            <button className={liked ? 'like-btn on' : 'like-btn'} onClick={() => { toggle(a); if (!liked) toast('Thanks for the like!', '❤️'); }} aria-pressed={liked} aria-label="Like article"><Heart size={17} /> {countOf(a)}</button>
            <button className="icon-btn" onClick={async () => toast((await copyText(window.location.href)) ? 'Link copied' : window.location.href, '🔗')} aria-label="Copy link"><Link2 size={18} /></button>
          </div>
        </div>
      </Reveal>

      <div id="article-body" className="prose">
        <p className="lead">{a.excerpt}</p>
        {a.body.map((p, i) => <p key={i}>{p}</p>)}
        <blockquote>Good engineering is a series of small, well-reasoned decisions. Make them visible, and your team will thank you.</blockquote>
      </div>

      {forYou && (
        <Link to={`/blog/${forYou.id}`} className="card pad for-you">
          <Sparkles size={18} /> <span><span className="muted small">Recommended for you by AI</span><br /><b>{forYou.title}</b></span>
        </Link>
      )}

      {related.length > 0 && (
        <>
          <h2>Related articles</h2>
          <div className="grid">{related.map((r) => <Link key={r.id} to={`/blog/${r.id}`} className="card pad post-card"><h3>{r.title}</h3><p className="muted small">{r.excerpt}</p></Link>)}</div>
        </>
      )}
    </article>
  );
}
