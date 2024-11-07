import { defineConfig } from 'vitepress';

export default defineConfig({
  description:
    '🚀 The OpenAPI to TypeScript codegen. Generate clients, SDKs, validators, and more.',
  lang: 'en-US',
  themeConfig: {
    nav: [
      {
        link: 'https://github.com/sponsors/mrlubos',
        text: 'Sponsor Hey API',
      },
    ],
    sidebar: [
      {
        items: [
          { link: '/openapi-ts/get-started', text: 'Get Started' },
          { link: '/openapi-ts/configuration', text: 'Configuration' },
        ],
        text: '@hey-api/openapi-ts',
      },
      {
        items: [
          { link: '/openapi-ts/output', text: 'Output' },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/clients/fetch',
                text: 'Fetch API',
              },
              {
                link: '/openapi-ts/clients/axios',
                text: 'Axios',
              },
              {
                link: '/openapi-ts/clients/legacy',
                text: 'Legacy',
              },
            ],
            link: '/openapi-ts/clients',
            text: 'Clients',
          },
          { link: '/openapi-ts/transformers', text: 'Transformers' },
        ],
        text: 'Guides and Concepts',
      },
      {
        items: [
          {
            link: '/openapi-ts/tanstack-query',
            text: 'TanStack Query',
          },
          {
            link: '/openapi-ts/zod',
            text: 'Zod <span class="soon">soon</span>',
          },
        ],
        text: 'Plugins',
      },
      {
        items: [
          {
            link: '/openapi-ts/integrations',
            text: 'GitHub <span class="soon">soon</span>',
          },
        ],
        text: 'Integrations',
      },
      {
        items: [
          { link: '/openapi-ts/migrating', text: 'Migrating' },
          { link: '/license', text: 'License' },
          { link: '/about', text: 'Philosophy' },
          { link: '/contributing', text: 'Contributing' },
        ],
        text: '@hey-api',
      },
    ],
  },
});
