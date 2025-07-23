import { defineConfig } from 'vitepress';

import en from './en';
import shared from './shared';

export default defineConfig({
  ...shared,
  locales: {
    ...shared.locales,
    root: { label: 'English', ...en },
  },
  vite: {
    ...shared.vite,
    resolve: {
      ...shared.vite?.resolve,
      preserveSymlinks: true,
    },
  },
});
