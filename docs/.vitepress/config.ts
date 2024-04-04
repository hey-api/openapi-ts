import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "OpenAPI TypeScript",
    description: "Turn your OpenAPI specification into a beautiful TypeScript client",
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/logo.png',
        nav: [
            { text: 'Guide', link: '/introduction' },
        ],
        sidebar: [
            {
                text: 'Guide',
                items: [
                    { text: 'Introduction', link: '/introduction' },
                    { text: 'Quick Start', link: '/quick-start' },
                    { text: 'Installation', link: '/installation' },
                    { text: 'Configuration', link: '/configuration' },
                    { text: 'Interceptors', link: '/interceptors' },
                    { text: 'Migrating', link: '/migrating' },
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' }
        ]
    }
})
