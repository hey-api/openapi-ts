import { defineConfig } from 'vitepress';

export default defineConfig({
  description:
    '🚀 The OpenAPI to TypeScript codegen. Generate clients, SDKs, validators, and more.',
  lang: 'en-US',
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/hey-api/openapi-ts/edit/main/docs/:path',
      text: 'Edit',
    },
    footer: {
      message: 'Released under the MIT License.',
    },
    nav: [
      {
        link: 'https://github.com/sponsors/hey-api',
        text: 'Sponsor Hey API',
      },
    ],
    outline: {
      label: 'Table of Contents',
      level: 2,
    },
    sidebar: [
      {
        items: [
          {
            link: '/openapi-ts/get-started',
            text: 'Get Started',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/configuration/input',
                text: 'Input',
              },
              {
                link: '/openapi-ts/configuration/output',
                text: 'Output',
              },
              {
                link: '/openapi-ts/configuration/parser',
                text: 'Parser',
              },
            ],
            link: '/openapi-ts/configuration',
            text: 'Configuration',
          },
        ],
        text: 'Introduction',
      },
      {
        items: [
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/output/typescript',
                text: 'TypeScript',
              },
              {
                link: '/openapi-ts/output/sdk',
                text: 'SDK',
              },
              {
                link: '/openapi-ts/output/client',
                text: 'Client',
              },
              {
                link: '/openapi-ts/output/json-schema',
                text: 'JSON Schema',
              },
            ],
            link: '/openapi-ts/output',
            text: 'Output',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/plugins/custom',
                text: 'Custom Plugin',
              },
            ],
            link: '/openapi-ts/plugins',
            text: 'Plugins',
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
                link: '/openapi-ts/clients/next-js',
                text: 'Next.js',
              },
              {
                link: '/openapi-ts/clients/nuxt',
                text: 'Nuxt',
              },
              {
                link: '/openapi-ts/clients/angular',
                text: 'Angular <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/clients/effect',
                text: 'Effect <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/clients/custom',
                text: 'Custom Client',
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
                link: '/openapi-ts/plugins/valibot',
                text: 'Valibot',
              },
              {
                link: '/openapi-ts/plugins/zod',
                text: 'Zod',
              },
              {
                link: '/openapi-ts/plugins/ajv',
                text: 'Ajv <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/arktype',
                text: 'Arktype <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/joi',
                text: 'Joi <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/superstruct',
                text: 'Superstruct <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/typebox',
                text: 'TypeBox <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/yup',
                text: 'Yup <span data-soon>soon</span>',
              },
            ],
            link: '/openapi-ts/validators',
            text: 'Validators',
          },
          {
            link: '/openapi-ts/transformers',
            text: 'Transformers',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/plugins/tanstack-query',
                text: 'TanStack Query',
              },
              {
                link: '/openapi-ts/plugins/pinia-colada',
                text: 'Pinia Colada <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/swr',
                text: 'SWR <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/zustand',
                text: 'Zustand <span data-soon>soon</span>',
              },
            ],
            link: '/openapi-ts/state-management',
            text: 'State Management',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/plugins/faker',
                text: 'Faker <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/msw',
                text: 'MSW <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/nock',
                text: 'Nock <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/supertest',
                text: 'Supertest <span data-soon>soon</span>',
              },
            ],
            link: '/openapi-ts/mocks',
            text: 'Mocks',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/plugins/fastify',
                text: 'Fastify',
              },
              {
                link: '/openapi-ts/plugins/adonis',
                text: 'Adonis <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/express',
                text: 'Express <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/hono',
                text: 'Hono <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/koa',
                text: 'Koa <span data-soon>soon</span>',
              },
              {
                link: '/openapi-ts/plugins/nest',
                text: 'Nest <span data-soon>soon</span>',
              },
            ],
            link: '/openapi-ts/web-frameworks',
            text: 'Web Frameworks',
          },
        ],
        text: 'Guides and Concepts',
      },
      {
        items: [
          {
            link: '/openapi-ts/community/spotlight',
            text: 'Spotlight',
          },
          {
            collapsed: true,
            items: [
              {
                link: '/openapi-ts/community/contributing/building',
                text: 'Building',
              },
              {
                link: '/openapi-ts/community/contributing/developing',
                text: 'Developing',
              },
              {
                link: '/openapi-ts/community/contributing/testing',
                text: 'Testing',
              },
            ],
            link: '/openapi-ts/community/contributing',
            text: 'Contributing',
          },
        ],
        text: 'Community',
      },
      {
        items: [
          {
            link: '/openapi-ts/integrations',
            text: 'GitHub',
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
            link: '/openapi-ts/license',
            text: 'License',
          },
          {
            link: 'https://github.com/orgs/hey-api/discussions/1495',
            text: 'Roadmap',
          },
        ],
        text: '@hey-api/openapi-ts',
      },
    ],
  },
  title: 'Hey API',
});
