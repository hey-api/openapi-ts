export default {
  input: '/tmp/test-spec.json',
  output: {
    path: './test-output-client-fetch',
  },
  plugins: [
    '@hey-api/typescript',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      asClass: false,
      name: '@hey-api/client-fetch',
    },
  ],
};
