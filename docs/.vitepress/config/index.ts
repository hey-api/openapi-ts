import { defineConfig } from 'vitepress';

import en from './en.js';
import shared from './shared.js';

export default defineConfig({
  ...shared,
  locales: {
    ...shared.locales,
    root: { label: 'English', ...en },
  },
});
