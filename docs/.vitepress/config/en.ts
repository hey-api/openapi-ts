import { defineConfig } from "vitepress";

export default defineConfig({
    lang: 'en-US',
    description: "Turn your OpenAPI specification into a beautiful TypeScript client",
    themeConfig: {
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
                ],
            },
        ],
    },
});
