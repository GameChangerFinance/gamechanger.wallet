import React, { useEffect, useId, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import { createPortal } from 'react-dom';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useColorMode } from '@docusaurus/theme-common';
import { useReader } from './ReaderPreferences';
import { walletIDEURL, walletPayload, truncateURL } from './studio.mjs';

function ActionIcon({ wallet = false }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">{wallet ? <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 8h18M16 12h5v5h-5z" /></> : <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />}</svg>;
}

export default function DocLink(props) {
  const { config, preferences } = useReader();
  const { colorMode } = useColorMode();
  const isBrowser = useIsBrowser();
  const dialog = useRef(null);
  const heading = useId();
  const [qrOpen, setQrOpen] = useState(false);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const encoded = walletPayload(props.href, config);
  useEffect(() => {
    if (!qrOpen) return;
    let active = true;
    setQr(null); setError('');
    import('./wallet-qr.mjs').then(module => module.walletQR(props.href, config.wallet.qr))
      .then(value => { if (active) setQr(value); }).catch(() => { if (active) setError('Unable to generate this QR code. Open the wallet in a new tab instead.'); });
    return () => { active = false; };
  }, [qrOpen, props.href, config]);
  if (encoded) {
    const original = new URL(props.href);
    const network = config.wallet.networks[original.searchParams.get('networkTag')];
    const label = network?.testnet ? config.labels.runTestnetWallet : config.labels.runWallet;
    const title = network ? `Run the script on ${network.title} Wallet` : 'Run the script in GameChanger Wallet';
    const ide = config.features.studio ? walletIDEURL(props.href, config, preferences, colorMode) : null;
    const launch = event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || preferences.walletMode === 'tab') return;
      event.preventDefault();
      if (preferences.walletMode === 'qr') { setQrOpen(true); dialog.current.showModal(); return; }
      const popup = window.open(props.href, '_blank', config.wallet.popupFeatures);
      if (!popup) window.open(props.href, '_blank');
    };
    return <>
      <span className="runnable-actions">
        <a className="button button--sm runnable-button runnable-wallet" href={props.href} target="_blank" rel="noopener noreferrer" title={title} onClick={launch}><ActionIcon wallet />{label}</a>
        {ide ? <a className="button button--sm runnable-button runnable-ide" href={ide} target="_blank" rel="noopener noreferrer" title="Edit this script in GCScript Studio"><ActionIcon />{config.labels.openIDE}</a> : null}
      </span>
      {isBrowser ? createPortal(<dialog ref={dialog} className="reader-dialog wallet-qr-dialog" aria-labelledby={heading} onClose={() => setQrOpen(false)}>
        <header><h2 id={heading}>Scan to run in Wallet</h2><button type="button" className="reader-button" onClick={() => dialog.current.close()} aria-label="Close wallet QR code">✕</button></header>
        {qr ? <img className="wallet-qr" src={qr} alt="QR code for this wallet script" /> : <p role={error ? 'alert' : 'status'}>{error || 'Generating QR code…'}</p>}
        <a className="button button--sm runnable-button runnable-wallet" href={props.href} target="_blank" rel="noopener noreferrer">Open wallet in a new tab</a>
        <footer className="wallet-qr-footer"><a href={props.href} title={props.href} target="_blank" rel="noopener noreferrer" aria-label="Open original wallet URL in a new tab">{truncateURL(props.href, config.wallet.urlPreviewLength)}</a></footer>
      </dialog>, document.body) : null}
    </>;
  }
  if (props.href?.startsWith(config.studio.editUrl)) return <a {...props} className="button button--sm runnable-button runnable-ide"><ActionIcon />{config.labels.openIDE}</a>;
  const artifact = props.href?.startsWith(config.baseUrl + config.paths.rawMount + '/');
  return artifact ? <a {...props} /> : <Link {...props} />;
}
