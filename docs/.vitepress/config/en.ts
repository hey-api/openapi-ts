import { defineConfig } from 'vitepress';

export default defineConfig({
    lang: 'en-US',
    description: 'Turn your OpenAPI specification into a beautiful TypeScript client',
    themeConfig: {
        sidebar: [
            {
                text: 'openapi-ts',
                items: [
                    { text: 'Get Started', link: '/get-started' },
                    { text: 'Configuration', link: '/configuration' },
                    { text: 'Interceptors', link: '/interceptors' },
                    { text: 'Migrating', link: '/migrating' },
                ],
            },
        ],
    },
});
