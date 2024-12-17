import { defineConfig } from 'vitepress';

export default defineConfig({
  description:
    '🚀 The OpenAPI to TypeScript codegen. Generate clients, SDKs, validators, and more.',
  lang: 'en-US',
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
    },
    nav: [
      {
        link: 'https://github.com/sponsors/hey-api',
        text: 'Sponsor Hey API',
      },
    ],
    sidebar: [
      {
        items: [
          {
            link: '/openapi-ts/get-started',
            text: 'Get Started',
          },
          {
            link: '/openapi-ts/configuration',
            text: 'Configuration',
          },
        ],
        text: '@hey-api/openapi-ts',
      },
      {
        items: [
          {
            link: '/openapi-ts/output',
            text: 'Output',
          },
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
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/validators/zod',
                text: 'Zod',
              },
            ],
            link: '/openapi-ts/validators',
            text: 'Validators',
          },
          {
            link: '/openapi-ts/transformers',
            text: 'Transformers',
          },
        ],
        text: 'Guides and Concepts',
      },
      {
        items: [
          {
            link: '/openapi-ts/plugins',
            text: 'Introduction',
          },
          {
            link: '/openapi-ts/fastify',
            text: 'Fastify',
          },
          {
            link: '/openapi-ts/tanstack-query',
            text: 'TanStack Query',
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
          {
            link: '/openapi-ts/migrating',
            text: 'Migrating',
          },
          {
            link: '/license',
            text: 'License',
          },
          {
            link: '/about',
            text: 'Philosophy',
          },
          {
            link: '/contributing',
            text: 'Contributing',
          },
        ],
        text: '@hey-api',
      },
    ],
  },
});
