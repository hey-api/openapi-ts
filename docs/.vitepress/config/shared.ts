import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'OpenAPI TypeScript',
    lastUpdated: false,
    sitemap: {
        hostname: 'https://heyapi.vercel.app',
    },
    head: [
        ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'en' }],
        ['meta', { property: 'og:title', content: 'Turn your OpenAPI specification into a beautiful TypeScript client' }],
        ['meta', { property: 'og:site_name', content: 'OpenAPI TypeScript' }],
        ['meta', { property: 'og:image', content: '/logo.png' }],
        ['meta', { property: 'og:url', content: 'https://heyapi.vercel.app' }],
        ['script', {}, 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };'],
        ['script', { defer: '', src: '/_vercel/insights/script.js' }],
    ],
    themeConfig: {
        logo: '/logo.png',
        socialLinks: [
            { icon: 'npm', link: 'https://npmjs.com/package/@hey-api/openapi-ts' },
            { icon: 'github', link: 'https://github.com/hey-api/openapi-ts' },
        ],
        search: {
            provider: 'local',
        }
    }
});
