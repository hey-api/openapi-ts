import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Wait for a number of milliseconds.
 * @param milliseconds The number of milliseconds to wait.
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
export async function upload(pathToOpenApi: string): Promise<void> {
  return new Promise(async resolve => {
    // TODO: throw if path is invalid
    if (!pathToOpenApi) {
      throw new Error('OpenAPI path is invalid')
    }

    // TODO: add timestamp/user id to name/bucket
    const fileBody = readFileSync(pathToOpenApi)
    const bucketId = 'openapi-specs'
    const parts = pathToOpenApi.split('/')
    const name = `test/${parts[parts.length - 1]}`
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(name, fileBody, {
        cacheControl: '3600',
        upsert: false
      })

    resolve()
  })
}
