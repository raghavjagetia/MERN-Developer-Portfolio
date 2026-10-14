import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Copy, Download, FolderGit2, Palette, Play, Search } from 'lucide-react';
import { articles, profile, projects } from '../data/data.js';
import { navLinks } from '../nav.js';
import { useUI } from '../context/UI.jsx';
import { useTracker } from '../context/Tracker.jsx';
import { copyText, downloadResume } from '../utils/resume.js';

export default function CommandPalette() {
  const { paletteOpen: open, setPaletteOpen: setOpen, toggleTheme, toast } = useUI();
  const { simulate, track } = useTracker();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [open]);

  const items = useMemo(() => [
    ...navLinks.map((l) => ({ group: 'Pages', label: l.label, icon: l.icon, run: () => nav(l.to) })),
    ...projects.map((p) => ({ group: 'Projects', label: p.title, hint: p.category, icon: FolderGit2, run: () => { track('project_view', p.id); nav(`/projects/${p.id}`); } })),
    ...articles.map((a) => ({ group: 'Articles', label: a.title, hint: `${a.readTime} min`, icon: BookOpen, run: () => nav(`/blog/${a.id}`) })),
    { group: 'Actions', label: 'Toggle light / dark theme', icon: Palette, run: toggleTheme },
    { group: 'Actions', label: 'Download resume', icon: Download, run: () => { track('resume_view', 'palette'); downloadResume(); toast('Resume downloaded', '📄'); } },
    { group: 'Actions', label: 'Copy email address', icon: Copy, run: async () => toast((await copyText(profile.email)) ? 'Email copied to clipboard' : profile.email, '📋') },
    { group: 'Actions', label: 'Simulate a visitor session (AI demo)', icon: Play, run: () => { simulate('random'); toast('Simulated visitor added — see AI Insights', '🧠'); } },
  ], [nav, track, toggleTheme, toast, simulate]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => `${i.label} ${i.group} ${i.hint || ''}`.toLowerCase().includes(s)) : items;
  }, [q, items]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (item) => { setOpen(false); item.run(); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && filtered[active]) run(filtered[active]);
  };

  let lastGroup = null;
  return (
    <div className="overlay" onClick={() => setOpen(false)}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-search">
          <Search size={18} />
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKeyDown} placeholder="Search pages, projects, articles, actions…" aria-label="Search" />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list" ref={listRef}>
          {filtered.length === 0 && <p className="muted center small" style={{ padding: 24 }}>No results for “{q}”</p>}
          {filtered.map((item, idx) => {
            const head = item.group !== lastGroup ? <div className="palette-group" key={`g-${item.group}`}>{item.group}</div> : null;
            lastGroup = item.group;
            const Icon = item.icon;
            return [
              head,
              <button key={`${item.group}-${item.label}`} data-active={idx === active} className={idx === active ? 'palette-item active' : 'palette-item'} onMouseEnter={() => setActive(idx)} onClick={() => run(item)}>
                <Icon size={16} /> <span>{item.label}</span> {item.hint && <small className="muted">{item.hint}</small>}
              </button>,
            ];
          })}
        </div>
        <div className="palette-foot muted small"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> select</span></div>
      </div>
    </div>
  );
}
