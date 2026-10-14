import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { profile } from '../data/data.js';
import { navLinks } from '../nav.js';
import { useUI } from '../context/UI.jsx';
import { useTracker } from '../context/Tracker.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme, setPaletteOpen } = useUI();
  const { insights, track } = useTracker();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
      setScrolled(h.scrollTop > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className={scrolled ? 'header scrolled' : 'header'}>
      <div className="progress" style={{ width: `${progress}%` }} />
      <div className="container header-in">
        <Link to="/" className="logo" aria-label="Home">
          <span className="logo-mark">AM</span>
          <span className="logo-text">{profile.name}</span>
        </Link>

        <nav className={open ? 'nav open' : 'nav'} aria-label="Main">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={16} className="nav-ico" />
              {label}
              {to === '/insights' && insights.total > 0 && <span className="dot" title={`${insights.total} events tracked`} />}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button className="kbd-btn" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
            <Search size={15} /> <span className="hide-sm">Search</span> <kbd className="hide-sm">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/contact" className="btn btn-sm hide-sm" onClick={() => track('contact_intent', 'header')}>Hire me</Link>
          <button className="icon-btn burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && <div className="nav-scrim" onClick={() => setOpen(false)} />}
    </header>
  );
}
