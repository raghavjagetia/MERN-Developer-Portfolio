import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useTracker } from '../context/Tracker.jsx';
import { Spotlight } from './Motion.jsx';

export function Thumb({ project, big }) {
  return (
    <div className={big ? 'thumb big' : 'thumb'} style={{ '--c1': project.color[0], '--c2': project.color[1] }}>
      <div className="thumb-window">
        <div className="thumb-bar"><i /><i /><i /></div>
        <div className="thumb-ui">
          <span className="thumb-title">{project.title.split(' ')[0]}</span>
          <span className="sk w60" /><span className="sk w80" /><span className="sk w40" />
          <div className="sk-row"><span className="sk-box" /><span className="sk-box" /><span className="sk-box" /></div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, onTech, activeTech, note, list }) {
  const { track } = useTracker();
  const open = () => track('project_view', project.id);
  return (
    <Spotlight as="article" tilt={!list} className={list ? 'card project-card list' : 'card project-card'}>
      <Link to={`/projects/${project.id}`} onClick={open} className="thumb-link" aria-label={`Open ${project.title} case study`}>
        <Thumb project={project} />
      </Link>
      <div className="card-body">
        <div className="row between">
          <span className="badge">{project.category}</span>
          <span className="muted small">{project.year}</span>
        </div>
        <h3><Link to={`/projects/${project.id}`} onClick={open}>{project.title}</Link></h3>
        <p className="muted">{project.summary}</p>
        {note && <p className="note"><Sparkles size={14} /> {note}</p>}
        <div className="chips">
          {project.tech.map((t) => (
            onTech
              ? <button key={t} className={activeTech === t ? 'chip active' : 'chip'} onClick={() => onTech(t)} aria-pressed={activeTech === t}>{t}</button>
              : <span key={t} className="chip static">{t}</span>
          ))}
        </div>
        <Link className="card-link" to={`/projects/${project.id}`} onClick={open}>
          Read case study <ArrowUpRight size={16} />
        </Link>
      </div>
    </Spotlight>
  );
}
