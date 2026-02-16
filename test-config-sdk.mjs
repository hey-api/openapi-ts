export default {
  input: '/tmp/test-spec.json',
  output: {
    path: './test-output-sdk',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
  ],
};
