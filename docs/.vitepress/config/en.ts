import { defineConfig } from 'vitepress';

export default defineConfig({
  description:
    'Turn your OpenAPI specification into a beautiful TypeScript client',
  lang: 'en-US',
  themeConfig: {
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
          { link: '/openapi-ts/migrating', text: 'Migrating' },
        ],
        text: 'Guides and Concepts',
      },
      {
        items: [
          {
            link: '/openapi-ts/integrations',
            text: 'Integrations <span class="soon">soon</span>',
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
          { link: '/about', text: 'Philosophy' },
          { link: '/contributing', text: 'Contributing' },
        ],
        text: '@hey-api',
      },
    ],
  },
});
