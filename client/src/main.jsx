import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TrackerProvider } from './context/Tracker.jsx';
import { UIProvider } from './context/UI.jsx';
import { loadData } from './data/data.js';
import './styles.css';

// Fetch portfolio content from the API, then render the app.
function Boot() {
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setState('loading');
    loadData()
      .then(() => setState('ready'))
      .catch((e) => { setError(e.message); setState('error'); });
  }, []);

  useEffect(load, [load]);

  if (state === 'ready') {
    return (
      <BrowserRouter>
        <UIProvider>
          <TrackerProvider>
            <App />
          </TrackerProvider>
        </UIProvider>
      </BrowserRouter>
    );
  }

  return (
    <div className="boot">
      <span className="logo-mark boot-mark">RJ</span>
      {state === 'loading' ? (
        <>
          <div className="boot-bar"><i /></div>
          <p className="muted small">Loading portfolio…</p>
        </>
      ) : (
        <>
          <h2>Couldn't reach the API</h2>
          <p className="muted small">{error}. Make sure the backend is running (<code>npm run dev</code>).</p>
          <button className="btn" onClick={load}>Try again</button>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Boot />
  </React.StrictMode>
);
