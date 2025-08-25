import { createClient } from '@hey-api/openapi-ts'

import type { PluginClientNames } from '../../../../../openapi-ts/src/plugins/types'

export const generateClient = async (
  dir: string,
  version: string,
  client: PluginClientNames,
  useOptions: boolean = false,
  name?: string
) => {
  await createClient({
    input: `../specs/${version}.json`,
    name,
    output: `./test/e2e/generated/${dir}/`,
    plugins: [
      '@hey-api/typescript',
      '@hey-api/schemas',
      client,
      {
        asClass: true,
        name: '@hey-api/sdk',
      },
    ],
    useOptions
  })
}
