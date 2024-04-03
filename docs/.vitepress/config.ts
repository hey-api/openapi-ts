import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OpenAPI TypeScript",
  description: "Turn your OpenAPI specification into a beautiful TypeScript client",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/introduction' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' }
    ]
  }
})
