// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
  },
  future: {
    compatibilityVersion: 4,
  },
  imports: {
    transform: {
      // Build was throwing an error.
      // see https://github.com/nuxt/nuxt/issues/18823#issuecomment-1419704343
      exclude: [/\bclient-nuxt\b/],
    },
  },
});
