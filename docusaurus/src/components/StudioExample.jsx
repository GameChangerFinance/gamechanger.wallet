import React, { useEffect, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { useReader } from './ReaderPreferences';
import { studioFrameHeight, studioURL } from './studio.mjs';

export default function StudioExample({ encoded, source, onClose, fallback }) {
  const { config, preferences } = useReader();
  const { colorMode } = useColorMode();
  const card = useRef(null);
  const [width, setWidth] = useState(0);
  const full = studioURL(encoded, config, preferences, colorMode);
  useEffect(() => {
    if (!card.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(card.current);
    return () => observer.disconnect();
  }, []);
  if (!full) return fallback;
  const embedded = studioURL(encoded, config, preferences, colorMode, true);
  const height = studioFrameHeight(source, preferences.view, width, config);
  return <section ref={card} className="studio-example" aria-label="Interactive GCScript example">
    <iframe key={embedded} src={embedded} title="GCScript Studio — editable example"
      loading="lazy" height={height}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-forms"
      referrerPolicy="no-referrer" onError={onClose} />
  </section>;
}
