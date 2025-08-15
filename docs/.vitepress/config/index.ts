import path from 'node:path';

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
      alias: {
        ...shared.vite?.resolve?.alias,
        '@components': path.resolve(__dirname, '..', 'theme', 'components'),
        '@data': path.resolve(__dirname, '..', '..', 'data'),
        '@versions': path.resolve(__dirname, '..', 'theme', 'versions'),
      },
      preserveSymlinks: true,
    },
  },
});
