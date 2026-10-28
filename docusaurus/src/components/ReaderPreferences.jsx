import React, { createContext, useContext, useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { readPreferences } from './studio.mjs';

const Context = createContext(null);

export function ReaderPreferences({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const config = siteConfig.customFields.reader;
  const [preferences, setPreferences] = useState(() => readPreferences(null, config));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setPreferences(readPreferences(localStorage.getItem(config.preferences.key), config)); } catch { /* Storage is optional. */ }
    setReady(true);
  }, [config]);
  useEffect(() => {
    if (ready) try { localStorage.setItem(config.preferences.key, JSON.stringify(preferences)); } catch { /* Reader options still work in memory. */ }
  }, [preferences, ready, config]);
  return <Context.Provider value={{ config, preferences, setPreferences }}>{children}</Context.Provider>;
}

export function useReader() { return useContext(Context); }
