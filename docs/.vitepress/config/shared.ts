import path from 'node:path';

import { defineConfig, type HeadConfig } from 'vitepress';
import llmstxt from 'vitepress-plugin-llms';

import { processImages } from './scripts/optimize-images.js';

const domain = process.env.SITE_DOMAIN || 'http://localhost:5173';

export default defineConfig({
  cleanUrls: true,
  head: [
    [
      'link',
      {
        href: '/assets/icons/dark.svg',
        media: '(prefers-color-scheme: dark)',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/svg',
      },
    ],
    [
      'link',
      {
        href: '/assets/icons/light.svg',
        media: '(prefers-color-scheme: light)',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/svg',
      },
    ],
    process.env.NODE_ENV === 'production' && [
      'script',
      {
        'data-website-id': '4dffba2d-03a6-4358-9d90-229038c8575d',
        defer: '',
        src: 'https://cloud.umami.is/script.js',
      },
    ],
  ].filter(Boolean) as Array<HeadConfig>,
  lastUpdated: true,
  sitemap: {
    hostname: domain,
    lastmodDateOnly: true,
    // filter out everything but index and `openapi-ts` pages
    transformItems: (items) =>
      items.filter((item) => !item.url || item.url.startsWith('openapi-ts')),
  },
  themeConfig: {
    externalLinkIcon: true,
    logo: {
      alt: 'Hey API logo',
      dark: '/assets/icons/dark.svg',
      light: '/assets/icons/light.svg',
    },
    search: {
      options: {
        apiKey: '2565c35b4ad91c2f8f8ae32cf9bbe899',
        appId: 'OWEH2O8E50',
        disableUserPersonalization: false,
        indexName: 'openapi-ts docs',
        insights: true,
      },
      provider: 'algolia',
    },
    socialLinks: [
      { icon: 'linkedin', link: 'https://linkedin.com/company/heyapi' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/heyapi.dev' },
      { icon: 'x', link: 'https://x.com/mrlubos' },
      { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' },
    ],
  },
  transformPageData: (pageData, context) => {
    pageData.frontmatter.head ??= [];

    const canonicalUrl = pageData.relativePath
      .replace(/index\.md$/, '')
      .replace(/\.md$/, context.siteConfig.cleanUrls ? '' : '.html');
    const url = `${domain}/${canonicalUrl}`;

    const head: Array<HeadConfig> = pageData.frontmatter.head;
    head.unshift(
      ['link', { href: url, rel: 'canonical' }],
      ['meta', { content: 'website', property: 'og:type' }],
      ['meta', { content: 'en_US', property: 'og:locale' }],
      ['meta', { content: 'Hey API', property: 'og:site_name' }],
      [
        'meta',
        {
          content: `${domain}/assets/.gen/openapi-ts-hero-640w.png`,
          property: 'og:image',
        },
      ],
      ['meta', { content: url, property: 'og:url' }],
      [
        'meta',
        {
          content:
            pageData.frontmatter.description ||
            '🌀 OpenAPI to TypeScript code generator. Generate API clients, SDKs, validators, and more.',
          property: 'og:description',
        },
      ],
      [
        'meta',
        {
          content: pageData.frontmatter.title || 'OpenAPI TypeScript',
          property: 'og:title',
        },
      ],
    );
  },
  vite: {
    plugins: [
      {
        async buildStart() {
          try {
            await processImages();
          } catch (error) {
            console.error('❌ Error optimizing images:', error);
          }
        },
        name: 'generate-images',
      },
      llmstxt({
        experimental: {
          depth: 2,
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: '@components',
          replacement: path.resolve(__dirname, '..', 'theme', 'components'),
        },
        {
          find: '@data',
          replacement: path.resolve(__dirname, '..', '..', 'data'),
        },
        {
          find: '@versions',
          replacement: path.resolve(__dirname, '..', 'theme', 'versions'),
        },
      ],
      preserveSymlinks: true,
    },
  },
});
