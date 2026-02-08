import { sveltekit } from '@sveltejs/kit/vite';
import { defineProject } from 'vitest/config';

export default async () => {
  const sveltekitPlugins = await sveltekit();
  return defineProject({
    plugins: [sveltekitPlugins],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  });
};
