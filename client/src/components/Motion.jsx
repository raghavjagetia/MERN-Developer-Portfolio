import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// Fades/slides children in when scrolled into view.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Counts up to a value like "30+", "4.7★" or "97" once visible.
export function Counter({ value, duration = 1400 }) {
  const [ref, inView] = useInView(0.4);
  const match = String(value).match(/^([^\d-]*)(-?[\d.]+)(.*)$/);
  const target = match ? parseFloat(match[2]) : 0;
  const decimals = match && match[2].includes('.') ? match[2].split('.')[1].length : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !match) return;
    if (reduced()) return setN(target);
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) return <span>{value}</span>;
  return <span ref={ref}>{match[1]}{n.toFixed(decimals)}{match[3]}</span>;
}

export function Typewriter({ words, speed = 70, pause = 1600 }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced()) return setText(words[0]);
    const word = words[i % words.length];
    const t = setTimeout(() => {
      if (!deleting && text === word) return setDeleting(true);
      if (deleting && text === '') { setDeleting(false); return setI((x) => x + 1); }
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, !deleting && text === word ? pause : deleting ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, deleting, i, words, speed, pause]);

  return <span className="typewriter" aria-label={words[i % words.length]}>{text}<i className="caret" aria-hidden="true" /></span>;
}

// Card with a cursor-following glow and optional 3D tilt.
export function Spotlight({ children, className = '', tilt = false, as: Tag = 'div', ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    if (tilt && !reduced()) {
      const rx = ((y / r.height) - 0.5) * -8;
      const ry = ((x / r.width) - 0.5) * 8;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <Tag ref={ref} className={`spot ${className}`} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHead({ eyebrow, title, text, children }) {
  return (
    <Reveal className="sec-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {children}
    </Reveal>
  );
}
