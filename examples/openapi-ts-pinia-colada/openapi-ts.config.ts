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
      // Enable auto-detection of query vs mutation based on HTTP method
      autoDetectHttpMethod: true,

      // Set to true to organize by tags
      // Export all tag files from index
      exportFromIndex: true,

      // Group generated files by OpenAPI tags for better organization
      groupByTag: true,

      name: '@pinia/colada',
      // Override specific operations if needed
      operationTypes: {
        // Example overrides (uncomment to use):
        // 'getPetById': 'both', // Generate both query and mutation
        // 'updatePet': 'query', // Force mutation to be a query
      }
    }
  ]
})
