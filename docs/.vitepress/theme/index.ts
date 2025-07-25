// eslint-disable-next-line simple-import-sort/imports
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

// custom CSS must be imported after default theme to correctly apply styles
import './custom.css';

import AuthorsList from './components/AuthorsList.vue';
import FeatureStatus from './components/FeatureStatus.vue';
import Heading from './components/Heading.vue';
import VersionLabel from './components/VersionLabel.vue';
import VersionSwitcher from './components/VersionSwitcher.vue';
import Layout from './Layout.vue';

export default {
  Layout,
  enhanceApp: ({ app }) => {
    app.component('AuthorsList', AuthorsList);
    app.component('FeatureStatus', FeatureStatus);
    app.component('Heading', Heading);
    app.component('VersionLabel', VersionLabel);
    app.component('VersionSwitcher', VersionSwitcher);
  },
  extends: DefaultTheme,
} satisfies Theme;
