// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-20',
  devtools: {
    enabled: false,
  },
  heyApi: {
    config: {
      input:
        'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
      plugins: [
        '@hey-api/schemas',
        {
          name: '@hey-api/sdk',
          transformer: true,
          validator: true,
        },
        {
          enums: 'javascript',
          name: '@hey-api/typescript',
        },
        '@hey-api/transformers',
        'zod',
      ],
    },
  },
  modules: ['@hey-api/nuxt'],
  vite: {
    optimizeDeps: {
      include: ['zod'],
    },
  },
});
