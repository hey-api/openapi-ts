import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { cleanup } from './scripts/cleanup'
import { compileWithTypescript } from './scripts/compileWithTypescript'
import { generateClient } from './scripts/generateClient'
import server from './scripts/server'

describe('client.node', () => {
  beforeAll(async () => {
    cleanup('client/node')
    await generateClient('client/node', 'v3', 'legacy/node', false, 'ApiClient')
    compileWithTypescript('client/node')
    await server.start('client/node')
  }, 40000)

  afterAll(async () => {
    await server.stop()
  })

  it('requests token', async () => {
    const { ApiClient } = await import('./generated/client/node/index.js')
    const tokenRequest = vi.fn().mockResolvedValue('MY_TOKEN')
    const client = new ApiClient({
      PASSWORD: undefined,
      TOKEN: tokenRequest,
      USERNAME: undefined
    })
    const result = await client.simple.getCallWithoutParametersAndResponse()
    expect(tokenRequest.mock.calls.length).toBe(1)
    // @ts-expect-error
    expect(result.headers.authorization).toBe('Bearer MY_TOKEN')
  })

  it('uses credentials', async () => {
    const { ApiClient } = await import('./generated/client/node/index.js')
    const client = new ApiClient({
      PASSWORD: 'password',
      TOKEN: undefined,
      USERNAME: 'username'
    })
    const result = await client.simple.getCallWithoutParametersAndResponse()
    // @ts-expect-error
    expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')
  })

  it('supports complex params', async () => {
    const { ApiClient } = await import('./generated/client/node/index.js')
    const client = new ApiClient()
    // @ts-expect-error
    const result = await client.complex.complexTypes({
      first: {
        second: {
          third: 'Hello World!'
        }
      }
    })
    expect(result).toBeDefined()
  })

  it('support form data', async () => {
    const { ApiClient } = await import('./generated/client/node/index.js')
    const client = new ApiClient()
    // @ts-expect-error
    const result = await client.parameters.callWithParameters(
      'valueHeader',
      'valueQuery',
      'valueForm',
      'valueCookie',
      'valuePath',
      {
        prop: 'valueBody'
      }
    )
    expect(result).toBeDefined()
  })

  it('can abort the request', async () => {
    let error
    try {
      const { ApiClient } = await import('./generated/client/node/index.js')
      const client = new ApiClient()
      const promise = client.simple.getCallWithoutParametersAndResponse()
      setTimeout(() => {
        promise.cancel()
      }, 10)
      await promise
    } catch (e) {
      error = (e as Error).message
    }
    expect(error).toContain('Request aborted')
  })

  it('should throw known error (500)', async () => {
    let error
    try {
      const { ApiClient } = await import('./generated/client/node/index.js')
      const client = new ApiClient()
      await client.error.testErrorCode(500)
    } catch (err) {
      error = JSON.stringify({
        body: err.body,
        message: err.message,
        name: err.name,
        status: err.status,
        statusText: err.statusText,
        url: err.url
      })
    }
    expect(error).toBe(
      JSON.stringify({
        body: {
          message: 'hello world',
          status: 500
        },
        message: 'Custom message: Internal Server Error',
        name: 'ApiError',
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://localhost:3000/base/api/v1.0/error?status=500'
      })
    )
  })

  it('should throw unknown error (599)', async () => {
    let error
    try {
      const { ApiClient } = await import('./generated/client/node/index.js')
      const client = new ApiClient()
      await client.error.testErrorCode(599)
    } catch (err) {
      error = JSON.stringify({
        body: err.body,
        message: err.message,
        name: err.name,
        status: err.status,
        statusText: err.statusText,
        url: err.url
      })
    }
    expect(error).toBe(
      JSON.stringify({
        body: {
          message: 'hello world',
          status: 599
        },
        message:
          'Generic Error: status: 599; status text: unknown; body: {\n  "message": "hello world",\n  "status": 599\n}',
        name: 'ApiError',
        status: 599,
        statusText: 'unknown',
        url: 'http://localhost:3000/base/api/v1.0/error?status=599'
      })
    )
  })
})
