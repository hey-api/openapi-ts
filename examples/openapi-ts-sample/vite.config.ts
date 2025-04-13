import { createViteConfig } from '@config/vite-base';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default createViteConfig({
  plugins: [react()],
});
