import { defineConfig, type HeadConfig } from 'vitepress';

export default defineConfig({
  head: [
    ['link', { href: '/logo.png', rel: 'icon', type: 'image/png' }],
    ['meta', { content: 'website', property: 'og:type' }],
    ['meta', { content: 'en', property: 'og:locale' }],
    [
      'meta',
      {
        content:
          'Turn your OpenAPI specification into a beautiful TypeScript client',
        property: 'og:title',
      },
    ],
    ['meta', { content: 'OpenAPI TypeScript', property: 'og:site_name' }],
    ['meta', { content: '/logo.png', property: 'og:image' }],
    ['meta', { content: 'https://heyapi.vercel.app', property: 'og:url' }],
    [
      'script',
      {},
      'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };',
    ],
    process.env.NODE_ENV === 'production' && [
      'script',
      { defer: '', src: '/_vercel/insights/script.js' },
    ],
  ].filter(Boolean) as HeadConfig[],
  lastUpdated: false,
  sitemap: {
    hostname: 'https://heyapi.vercel.app',
  },
  themeConfig: {
    externalLinkIcon: true,
    logo: '/logo.png',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'npm', link: 'https://npmjs.com/package/@hey-api/openapi-ts' },
      { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' },
    ],
  },
  title: 'Hey API',
});
