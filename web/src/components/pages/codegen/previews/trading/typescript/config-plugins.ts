export default defineConfig({
  input: 'https://api.tradespark.io/openapi.json',
  output: 'src/trading-client',
  plugins: ['@hey-api/sdk', 'zod', '@tanstack/react-query'],
});
