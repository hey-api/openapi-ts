import { createClient } from '../../../'
import type { PluginClientNames } from '../../../src/plugins/types'

export const generateClient = async (
  dir: string,
  version: string,
  client: PluginClientNames,
  useOptions: boolean = false,
  name?: string
) => {
  await createClient({
    input: `./test/spec/${version}.json`,
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
