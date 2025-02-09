import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // @ts-ignore
  plugins: [
    // @ts-expect-error
    sveltekit(),
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
