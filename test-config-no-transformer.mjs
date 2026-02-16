export default {
  input: '/tmp/test-spec-complex.json',
  output: {
    path: './test-output-no-transformer',
  },
  plugins: [
    '@hey-api/typescript',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      name: '@hey-api/sdk',
      // transformer: true,  // NOT enabled
    },
  ],
};
