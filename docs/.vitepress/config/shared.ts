import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'OpenAPI TypeScript',
    lastUpdated: true,
    sitemap: {
        hostname: 'https://heyapi.vercel.app',
    },
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ],
    themeConfig: {
        logo: '/logo.png',
        socialLinks: [
            { icon: 'npm', link: 'https://www.npmjs.com/package/@hey-api/openapi-ts' },
            { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' },
        ],
    }
});
