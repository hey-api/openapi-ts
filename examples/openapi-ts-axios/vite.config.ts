import react from '@vitejs/plugin-react';

/** @type {import('vite').UserConfig} */
export default {
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [react()],
};
