import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
  const [toasts, setToasts] = useState([]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const toast = useCallback((msg, icon = '✨') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t.slice(-2), { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <Ctx.Provider value={{ theme, toggleTheme, toast, paletteOpen, setPaletteOpen }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast"><span>{t.icon}</span>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useUI = () => useContext(Ctx);
