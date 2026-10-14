import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, Brain, X } from 'lucide-react';
import { useTracker } from '../context/Tracker.jsx';
import { useUI } from '../context/UI.jsx';

// Floating AI assistant that surfaces live insights while the visitor browses, plus back-to-top.
export default function AIWidget() {
  const { insights } = useTracker();
  const { toast } = useUI();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const top = insights.interests[0]?.name;
  const last = useRef(top);

  useEffect(() => {
    if (top && top !== last.current && insights.total >= 4 && pathname !== '/insights') toast(`AI noticed you're interested in ${top}`, '🧠');
    last.current = top;
  }, [top]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const next = insights.recommendations.find((r) => r.unseen) || insights.recommendations[0];

  return (
    <div className="fab-wrap">
      {showTop && (
        <button className="fab fab-sm" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp size={18} />
        </button>
      )}
      {open && (
        <div className="ai-panel" role="dialog" aria-label="AI insights">
          <div className="row between"><strong className="row gap-sm"><Brain size={16} /> Live AI insights</strong><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button></div>
          {insights.total < 2 ? (
            <p className="muted small">Explore a few projects or skills and I'll personalise suggestions for you.</p>
          ) : (
            <>
              <p className="small muted" style={{ marginBottom: 6 }}>Your top interests</p>
              <div className="chips">{insights.interests.slice(0, 4).map((i) => <span key={i.name} className="chip static">{i.name}</span>)}</div>
              <p className="small muted" style={{ margin: '10px 0 6px' }}>Visitor profile: <b className="text">{insights.visitorType}</b></p>
              {next && (
                <Link to={`/projects/${next.project.id}`} className="ai-rec">
                  <span className="small muted">Recommended for you</span>
                  <strong>{next.project.title}</strong>
                </Link>
              )}
            </>
          )}
          <Link to="/insights" className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Open AI dashboard</Link>
        </div>
      )}
      <button className="fab" aria-label="Open AI insights" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Brain size={22} />
        {insights.total > 0 && <span className="fab-badge">{insights.total > 99 ? '99+' : insights.total}</span>}
      </button>
    </div>
  );
}
