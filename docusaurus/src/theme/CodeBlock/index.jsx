import React, { useState } from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import CodeBlock from '@theme-original/CodeBlock';
import { useReader } from '../../components/ReaderPreferences';
import StudioExample from '../../components/StudioExample';

export default function EnhancedCodeBlock(props) {
  const { embedEnabled } = useReader();
  const isBrowser = useIsBrowser();
  const [open, setOpen] = useState(true);
  const encoded = /(?:^|\s)studio=([\w-]+)/.exec(props.metastring ?? '')?.[1];
  const native = <CodeBlock {...props} metastring={(props.metastring ?? '').replace(/(?:^|\s)studio=[\w-]+/, '')} />;
  // Keep native code in static HTML and without JavaScript. Hydration replaces
  // it with Studio; closing the editor restores that same native code block.
  return encoded && open && isBrowser && embedEnabled
    ? <StudioExample encoded={encoded} source={String(props.children ?? '')} onClose={() => setOpen(false)} fallback={native} />
    : native;
}
