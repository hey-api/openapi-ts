import { createClient } from '../../../'
import type { Config } from '../../../src/types/config'

export const generateClient = async (
  dir: string,
  version: string,
  client: Config['client']['name'],
  useOptions: boolean = false,
  name?: string
) => {
  await createClient({
    client,
    input: `./test/spec/${version}.json`,
    name,
    output: `./test/e2e/generated/${dir}/`,
    plugins: ['@hey-api/types', '@hey-api/schemas', {
      asClass: true,
      name: '@hey-api/services',
    }],
    useOptions
  })
}
