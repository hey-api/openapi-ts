// eslint-disable-next-line simple-import-sort/imports
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

// custom CSS must be imported after default theme to correctly apply styles
import './custom.css';

import AuthorsList from './components/AuthorsList.vue';
import VersionSwitcher from './components/VersionSwitcher.vue';
import Layout from './Layout.vue';

export default {
  Layout,
  enhanceApp: ({ app }) => {
    app.component('AuthorsList', AuthorsList);
    app.component('VersionSwitcher', VersionSwitcher);
  },
  extends: DefaultTheme,
} satisfies Theme;
