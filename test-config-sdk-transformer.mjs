export default {
  input: '/tmp/test-spec.json',
  output: {
    path: './test-output-sdk-transformer',
  },
  plugins: [
    '@hey-api/typescript',
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
    },
  ],
};
