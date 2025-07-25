import { defineConfig, type HeadConfig } from 'vitepress';

export default defineConfig({
  cleanUrls: true,
  head: [
    [
      'link',
      {
        href: '/images/logo-16w.png',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    [
      'link',
      {
        href: '/images/logo-32w.png',
        rel: 'icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    [
      'link',
      {
        href: '/images/logo-48w.png',
        rel: 'icon',
        sizes: '48x48',
        type: 'image/png',
      },
    ],
    ['meta', { content: 'website', property: 'og:type' }],
    ['meta', { content: 'en', property: 'og:locale' }],
    [
      'meta',
      {
        content:
          '🚀 The OpenAPI to TypeScript codegen. Generate clients, SDKs, validators, and more.',
        property: 'og:title',
      },
    ],
    ['meta', { content: 'OpenAPI TypeScript', property: 'og:site_name' }],
    ['meta', { content: '/images/logo-640w.png', property: 'og:image' }],
    ['meta', { content: 'https://heyapi.dev', property: 'og:url' }],
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
    hostname: 'https://heyapi.dev',
  },
  themeConfig: {
    externalLinkIcon: true,
    logo: '/images/logo-48w.png',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'linkedin', link: 'https://linkedin.com/company/heyapi' },
      { icon: 'x', link: 'https://x.com/mrlubos' },
      { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' },
    ],
  },
  title: 'Hey API',
});
