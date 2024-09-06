import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { cleanup } from './scripts/cleanup'
import { compileWithTypescript } from './scripts/compileWithTypescript'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'

describe('v2.fetch', () => {
  beforeAll(async () => {
    cleanup('v2/fetch')
    await generateClient('v2/fetch', 'v2', 'legacy/fetch')
    compileWithTypescript('v2/fetch')
    await server.start('v2/fetch')
  }, 40000)

  afterAll(async () => {
    await server.stop()
  })

  it('requests token', async () => {
    const { OpenAPI, SimpleService } = await import(
      './generated/v2/fetch/index.js'
    )
    const tokenRequest = vi.fn().mockResolvedValue('MY_TOKEN')
    OpenAPI.TOKEN = tokenRequest
    const result = await SimpleService.getCallWithoutParametersAndResponse()
    // @ts-expect-error
    expect(result.headers.authorization).toBe('Bearer MY_TOKEN')
  })

  it('supports complex params', async () => {
    const { ComplexService } = await import('./generated/v2/fetch/index.js')
    const result = await ComplexService.complexTypes({
      // @ts-expect-error
      first: {
        second: {
          third: 'Hello World!'
        }
      }
    })
    expect(result).toBeDefined()
  })
})

describe('v2.fetch useOptions', () => {
  beforeAll(async () => {
    cleanup('v2/fetch')
    await generateClient('v2/fetch', 'v2', 'legacy/fetch', true)
    compileWithTypescript('v2/fetch')
    await server.start('v2/fetch')
  }, 40000)

  afterAll(async () => {
    await server.stop()
  })

  it('returns result body by default', async () => {
    const { SimpleService } = await import('./generated/v2/fetch/index.js')
    const result = await SimpleService.getCallWithoutParametersAndResponse()
    // @ts-expect-error
    expect(result.body).toBeUndefined()
  })

  it('returns result body', async () => {
    const { SimpleService } = await import('./generated/v2/fetch/index.js')
    // @ts-expect-error
    const result = await SimpleService.getCallWithoutParametersAndResponse({
      _result: 'body'
    })
    // @ts-expect-error
    expect(result.body).toBeUndefined()
  })

  it('returns raw result', async ({ skip }) => {
    skip()
    const { SimpleService } = await import('./generated/v2/fetch/index.js')
    // @ts-expect-error
    const result = await SimpleService.getCallWithoutParametersAndResponse({
      _result: 'raw'
    })
    // @ts-expect-error
    expect(result.body).toBeDefined()
  })
})
