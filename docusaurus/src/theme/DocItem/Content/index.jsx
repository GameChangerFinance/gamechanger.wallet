import React from 'react';
import Content from '@theme-original/DocItem/Content';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { useReader } from '../../../components/ReaderPreferences';

export default function DocContent(props) {
  const { metadata } = useDoc();
  const { config } = useReader();
  const { siteConfig } = useDocusaurusContext();
  return <>
    {metadata.permalink === config.baseUrl ? <section className="docs-hero" aria-label="GameChanger developer documentation">
      <p className="docs-kicker">{config.hero.kicker}</p>
      <h2>{config.tagline}</h2>
      <p className="docs-lead">{config.description}</p>
      <div className="reader-actions">{siteConfig.themeConfig.navbar.items.filter(item => item.to).map((item, index) => <Link key={item.to} className={`button button--${index === 0 ? 'primary' : 'secondary'}`} to={item.to}>{item.label} ↗</Link>)}</div>
      <p className="studio-note">{config.hero.note}</p>
    </section> : null}
    <Content {...props} />
  </>;
}
