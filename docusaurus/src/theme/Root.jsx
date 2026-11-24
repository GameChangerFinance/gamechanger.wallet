import React from 'react';
import { ReaderPreferences } from '../components/ReaderPreferences';

export default function Root({ children }) {
  return <ReaderPreferences>{children}</ReaderPreferences>;
}
