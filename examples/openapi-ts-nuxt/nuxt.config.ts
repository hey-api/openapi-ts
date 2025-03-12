// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
  },
  future: {
    compatibilityVersion: 4,
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
  imports: {
    transform: {
      // Build was throwing an error.
      // see https://github.com/nuxt/nuxt/issues/18823#issuecomment-1419704343
      exclude: [/\bclient-nuxt\b/],
    },
  },
  modules: ['@hey-api/nuxt'],
});
