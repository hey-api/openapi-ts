export default {
  input: '/tmp/test-spec.json',
  output: {
    path: './test-output',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
  ],
};
