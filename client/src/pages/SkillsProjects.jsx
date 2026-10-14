import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search, X } from 'lucide-react';
import { allTech, categories, projects, skillGroups } from '../data/data.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { Reveal, SectionHead } from '../components/Motion.jsx';
import { useTracker } from '../context/Tracker.jsx';

const levels = [
  { min: 90, name: 'Expert' },
  { min: 80, name: 'Advanced' },
  { min: 70, name: 'Proficient' },
  { min: 0, name: 'Familiar' },
];
const levelName = (n) => levels.find((l) => n >= l.min).name;

function SkillRing({ value }) {
  const R = 22, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 56 56" className="ring" aria-hidden="true">
      <circle cx="28" cy="28" r={R} className="ring-bg" />
      <circle cx="28" cy="28" r={R} className="ring-fg" strokeDasharray={`${(value / 100) * C} ${C}`} transform="rotate(-90 28 28)" />
      <text x="28" y="32" textAnchor="middle">{value}</text>
    </svg>
  );
}

export default function SkillsProjects() {
  const { track } = useTracker();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [groupTab, setGroupTab] = useState(skillGroups[0].category);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const projectsRef = useRef(null);
  const tech = params.get('tech') || '';

  const setTech = (t) => {
    const next = t === tech ? '' : t;
    setParams(next ? { tech: next } : {}, { replace: true });
    if (next) track('tech_click', next);
  };

  const pickSkill = (s) => {
    setSelectedSkill(s.name === selectedSkill ? null : s.name);
    track('skill_explore', s.name);
  };

  const showSkillProjects = (name) => {
    if (name !== tech) setTech(name);
    projectsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        (!tech || p.tech.includes(tech)) &&
        (!q || [p.title, p.summary, p.category, ...p.tech].join(' ').toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => (sort === 'newest' ? b.year - a.year : sort === 'oldest' ? a.year - b.year : a.title.localeCompare(b.title)));
  }, [query, cat, tech, sort]);

  const catCount = (c) => (c === 'All' ? projects.length : projects.filter((p) => p.category === c).length);
  const group = skillGroups.find((g) => g.category === groupTab);
  const skillProjects = selectedSkill ? projects.filter((p) => p.tech.includes(selectedSkill)) : [];
  const hasFilters = query || cat !== 'All' || tech;
  const clearAll = () => { setQuery(''); setCat('All'); setParams({}, { replace: true }); };

  return (
    <div className="container section">
      <Reveal className="page-head">
        <span className="eyebrow">Skills & Projects</span>
        <h1 className="display-sm">Things I'm good at, <span className="grad">and things I've built.</span></h1>
        <p className="lead">Click any skill to explore it, or filter projects by category, technology or keyword.</p>
      </Reveal>

      <SectionHead eyebrow="Skills" title="Technical skills" />
      <div className="tabs" role="tablist">
        {skillGroups.map((g) => (
          <button key={g.category} role="tab" aria-selected={g.category === groupTab} className={g.category === groupTab ? 'tab active' : 'tab'} onClick={() => { setGroupTab(g.category); setSelectedSkill(null); }}>
            {g.category}
          </button>
        ))}
      </div>
      <div className="skills-grid" key={groupTab}>
        {group.skills.map((s, i) => (
          <button key={s.name} className={selectedSkill === s.name ? 'skill-card active' : 'skill-card'} onClick={() => pickSkill(s)} style={{ animationDelay: `${i * 60}ms` }} aria-pressed={selectedSkill === s.name}>
            <SkillRing value={s.level} />
            <div>
              <strong>{s.name}</strong>
              <span className={`lvl lvl-${levelName(s.level).toLowerCase()}`}>{levelName(s.level)}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="level-legend muted small">
        {levels.map((l) => <span key={l.name}><i className={`lvl-dot lvl-${l.name.toLowerCase()}`} /> {l.name} {l.min ? `${l.min}+` : '<70'}</span>)}
      </div>
      {selectedSkill && (
        <div className="skill-detail card pad fade-in">
          <div className="row between wrap">
            <div>
              <strong>{selectedSkill}</strong>
              <p className="muted small" style={{ margin: 0 }}>Used in {skillProjects.length} project{skillProjects.length === 1 ? '' : 's'}{skillProjects.length ? `: ${skillProjects.map((p) => p.title).join(', ')}` : ' shown here — applied in client and work projects.'}</p>
            </div>
            {skillProjects.length > 0 && <button className="btn btn-sm" onClick={() => showSkillProjects(selectedSkill)}>Show these projects</button>}
          </div>
        </div>
      )}

      <div ref={projectsRef} style={{ scrollMarginTop: 90 }} />
      <SectionHead eyebrow="Projects" title="Project showcase">
        <div className="row gap-sm">
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects" className="select-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A → Z</option>
          </select>
          <div className="seg" role="group" aria-label="View">
            <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={16} /></button>
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view"><List size={16} /></button>
          </div>
        </div>
      </SectionHead>

      <div className="filters card pad">
        <div className="search-box">
          <Search size={18} />
          <input type="search" placeholder="Search by name, technology or category…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search projects" />
          {query && <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        </div>
        <div className="chips">
          {['All', ...categories].map((c) => (
            <button key={c} className={cat === c ? 'chip active' : 'chip'} onClick={() => setCat(c)} aria-pressed={cat === c}>{c} <span className="count">{catCount(c)}</span></button>
          ))}
        </div>
        <div className="chips">
          <span className="muted small">Technology</span>
          {allTech.map((t) => (
            <button key={t} className={tech === t ? 'chip active' : 'chip'} onClick={() => setTech(t)} aria-pressed={tech === t}>{t}</button>
          ))}
        </div>
      </div>

      <div className="row between results-bar">
        <span className="muted small">Showing <b className="text">{filtered.length}</b> of {projects.length} projects{tech && <> using <b className="text">{tech}</b></>}</span>
        {hasFilters && <button className="link-btn" onClick={clearAll}><X size={14} /> Clear filters</button>}
      </div>

      {filtered.length ? (
        <div className={view === 'grid' ? 'grid' : 'list-view'}>
          {filtered.map((p, i) => (
            <div key={p.id} className="pop-in" style={{ animationDelay: `${i * 50}ms` }}>
              <ProjectCard project={p} activeTech={tech} onTech={setTech} list={view === 'list'} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty card pad center">
          <Search size={32} className="muted" />
          <h3>No projects match your filters</h3>
          <button className="btn btn-sm" onClick={clearAll}>Reset filters</button>
        </div>
      )}
    </div>
  );
}
