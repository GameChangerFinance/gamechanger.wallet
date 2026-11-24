import React, { createContext, useContext, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { readPreferences } from './studio.mjs';

const Context = createContext(null);

export function ReaderPreferences({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const config = siteConfig.customFields.reader;
  const [preferences, setPreferences] = useState(() => readPreferences(null, config));
  const [mobile, setMobile] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${config.studio.mobileMaxWidth}px)`);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [config.studio.mobileMaxWidth]);
  useEffect(() => {
    try { setPreferences(readPreferences(localStorage.getItem(config.preferences.key), config)); } catch { /* Storage is optional. */ }
    setReady(true);
  }, [config]);
  useEffect(() => {
    if (ready) try { localStorage.setItem(config.preferences.key, JSON.stringify(preferences)); } catch { /* Reader options still work in memory. */ }
  }, [preferences, ready, config]);
  const embedEnabled = ready && (preferences.embedMode === 'always' ||
    (preferences.embedMode === 'not on mobile' && !mobile));
  return <Context.Provider value={{ config, preferences, setPreferences, embedEnabled }}>{children}</Context.Provider>;
}

export function useReader() { return useContext(Context); }
