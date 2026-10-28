import React from 'react';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import { useReader } from './ReaderPreferences';
import { studioURL, walletPayload } from './studio.mjs';

export default function DocLink(props) {
  const { config, preferences } = useReader();
  const { colorMode } = useColorMode();
  const encoded = config.features.studio ? walletPayload(props.href, config) : null;
  const ide = encoded ? studioURL(encoded, config, preferences, colorMode) : null;
  // Artifacts are actual files, not React routes: routing would append a slash
  // to .html/.gcscript/image URLs and prevent independent dapps from opening.
  const artifact = props.href?.startsWith(config.baseUrl + config.paths.rawMount + '/');
  return <>{artifact ? <a {...props} /> : <Link {...props} />}{ide ? <> <a className="ide-link" href={ide} target="_blank" rel="noopener noreferrer">{config.labels.openIDE}</a></> : null}</>;
}
