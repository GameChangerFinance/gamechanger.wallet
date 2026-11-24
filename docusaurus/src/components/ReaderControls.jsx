import React, { useEffect, useId, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import { useReader } from './ReaderPreferences';
import { readPreferences } from './studio.mjs';

export default function ReaderControls() {
  const controlId = useId();
  const { config, preferences, setPreferences } = useReader();
  const { colorMode, setColorMode } = useColorMode();
  const dialog = useRef(null);
  const searchDialog = useRef(null);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    if (!searchOpen || index) return;
    const controller = new AbortController();
    setError(false);
    fetch(config.baseUrl + config.search.indexFilename, { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('Search index unavailable'); return response.json(); })
      .then(setIndex).catch(cause => { if (cause.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [searchOpen, index, config]);
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = words.length && index ? index.filter(item => words.every(word => `${item.title} ${item.text}`.toLocaleLowerCase().includes(word))).slice(0, config.search.limit) : [];
  return <div className="reader-controls">
    {config.features.search ? <button type="button" className="reader-button reader-trigger" aria-label={config.labels.search} onClick={() => { setSearchOpen(true); searchDialog.current.showModal(); }}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><span className="reader-label">{config.labels.search}</span></button> : null}
    {config.features.options ? <button type="button" className="reader-button reader-trigger" aria-label={config.labels.options} onClick={() => dialog.current.showModal()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></svg><span className="reader-label">{config.labels.options}</span></button> : null}
    <dialog ref={dialog} className="reader-dialog" aria-labelledby={`${controlId}-reader-title`}>
      <form method="dialog">
        <header><h2 id={`${controlId}-reader-title`}>{config.labels.options}</h2><button className="reader-button" aria-label="Close options">✕</button></header>
        <label htmlFor={`${controlId}-wallet-mode`}>Wallet links</label>
        <select id={`${controlId}-wallet-mode`} value={preferences.walletMode} onChange={event => setPreferences({ ...preferences, walletMode: event.target.value })}>
          <option value="popup">Open popup</option><option value="tab">Open new tab</option><option value="qr">Show QR code</option>
        </select>
        <label htmlFor={`${controlId}-docs-theme`}>Documentation theme</label>
        <select id={`${controlId}-docs-theme`} value={colorMode} onChange={event => setColorMode(event.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select>
        <label htmlFor={`${controlId}-studio-embed`}>Embedded IDE</label>
        <select id={`${controlId}-studio-embed`} value={preferences.embedMode} onChange={event => setPreferences({ ...preferences, embedMode: event.target.value })}>
          {config.studio.embedModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        <label htmlFor={`${controlId}-studio-view`}>GCScript Studio view</label>
        <select id={`${controlId}-studio-view`} value={preferences.view} onChange={event => setPreferences({ ...preferences, view: event.target.value })}>
          {config.studio.views.map(view => <option key={view} value={view}>{view === 'node' ? 'Nodes' : view === 'block' ? 'Blocks' : 'Code'}</option>)}
        </select>
        <label htmlFor={`${controlId}-studio-theme`}>Studio theme</label>
        <select id={`${controlId}-studio-theme`} value={preferences.theme} disabled={!config.studio.themeParameter} aria-describedby={`${controlId}-studio-theme-help`} onChange={event => setPreferences({ ...preferences, theme: event.target.value })}>
          {config.studio.themes.map(theme => <option key={theme} value={theme}>{theme === 'match' ? 'Match documentation' : theme === 'dark' ? 'Dark' : 'Light'}</option>)}
        </select>
        <p id={`${controlId}-studio-theme-help`} className="studio-note">{config.studio.themeParameter ? 'Theme follows the selected policy.' : 'Hosted Studio currently controls its own theme. Theme matching requires the documented Studio compatibility patch.'} View or theme changes reload loaded editors. Disabling embeds or resizing to mobile in “not on mobile” mode closes editors. Copy any edits first.</p>
        <div className="reader-actions"><button type="button" className="button button--secondary" onClick={() => setPreferences(readPreferences(null, config))}>Reset preferences</button><button className="button button--primary">Done</button></div>
      </form>
    </dialog>
    <dialog ref={searchDialog} className="reader-dialog search-dialog" aria-labelledby={`${controlId}-search-title`} onClose={() => setSearchOpen(false)}>
      <header><h2 id={`${controlId}-search-title`}>{config.labels.search}</h2><button type="button" className="reader-button" aria-label="Close search" onClick={() => searchDialog.current.close()}>✕</button></header>
      <label htmlFor={`${controlId}-docs-search`}>Search guides and examples</label>
      <input id={`${controlId}-docs-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" />
      {!index && !error ? <p role="status">Loading search index…</p> : null}
      {error ? <p role="alert">Search could not load. Close and reopen search to retry.</p> : null}
      {index && !words.length ? <p>Try “multisig”, “minting” or “GCScript”.</p> : null}
      {words.length && index && !results.length ? <p role="status">No results. Try another term.</p> : null}
      <ul className="search-results" aria-live="polite">{results.map(item => <li key={item.url}><Link to={item.url} onClick={() => searchDialog.current.close()}>{item.title}</Link><p>{item.text.slice(0, config.search.excerptLength)}…</p></li>)}</ul>
    </dialog>
  </div>;
}
