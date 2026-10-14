import { useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import AIWidget from './components/AIWidget.jsx';
import Home from './pages/Home.jsx';
import SkillsProjects from './pages/SkillsProjects.jsx';
import CaseStudy from './pages/CaseStudy.jsx';
import Experience from './pages/Experience.jsx';
import ResumeContact from './pages/ResumeContact.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Certifications from './pages/Certifications.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import { useTracker } from './context/Tracker.jsx';
import { profile } from './data/data.js';

const titles = {
  '/': 'Home', '/projects': 'Skills & Projects', '/experience': 'Experience & Education', '/contact': 'Resume & Contact',
  '/insights': 'AI Insights', '/certifications': 'Certifications & Achievements', '/about': 'About', '/blog': 'Blog',
};

function NotFound() {
  return (
    <div className="container section center notfound">
      <h1 className="display grad">404</h1>
      <p className="lead">This page wandered off. Let's get you back on track.</p>
      <Link to="/" className="btn">Go home</Link>
    </div>
  );
}

export default function App() {
  const { track } = useTracker();
  const { pathname } = useLocation();
  const visited = useRef(false);

  useEffect(() => {
    if (visited.current) return; // StrictMode double-invoke guard
    visited.current = true;
    try {
      if (!sessionStorage.getItem('visit_logged')) {
        track('visit');
        sessionStorage.setItem('visit_logged', '1');
      }
    } catch { track('visit'); }
  }, [track]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const base = titles[pathname] || (pathname.startsWith('/projects/') ? 'Case Study' : pathname.startsWith('/blog/') ? 'Article' : 'Not found');
    document.title = `${base} · ${profile.name}`;
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <div className="bg-orbs" aria-hidden="true"><span /><span /><span /></div>
      <Header />
      <main id="main" key={pathname} className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<SkillsProjects />} />
          <Route path="/projects/:id" element={<CaseStudy />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<ResumeContact />} />
          <Route path="/insights" element={<Dashboard />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CommandPalette />
      <AIWidget />
    </>
  );
}
