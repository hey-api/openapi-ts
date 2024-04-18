import { describe, expect, it } from 'vitest'

import { enumKey } from '../enum'

describe('enumKey', () => {
  it('returns custom name', () => {
    expect(enumKey('foo', 'bar')).toBe('bar')
  })

  it('returns number prefixed with underscore', () => {
    expect(enumKey(100)).toBe("'_100'")
  })

  it('returns empty string', () => {
    expect(enumKey('')).toBe('EMPTY_STRING')
  })

  it('returns uppercased value', () => {
    expect(enumKey('abc')).toEqual('ABC')
    expect(enumKey('æbc')).toEqual('ÆBC')
    expect(enumKey('æb.c')).toEqual('ÆB_C')
    expect(enumKey('1æb.c')).toEqual('_1ÆB_C')
    expect(enumKey("'quoted'")).toEqual('_QUOTED_')
  })
})
