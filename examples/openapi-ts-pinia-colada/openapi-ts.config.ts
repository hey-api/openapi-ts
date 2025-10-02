import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client'
  },
  plugins: [
    '@hey-api/client-fetch',
    '@hey-api/schemas',
    '@hey-api/sdk',
    {
      enums: 'javascript',
      name: '@hey-api/typescript'
    },
    {
      exportFromIndex: true,
      name: '@pinia/colada',
      queryKeys: false
    }
  ]
})
