import { sync } from 'cross-spawn'
import { describe, expect, it } from 'vitest'

describe('bin', () => {
  it('supports required parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).not.toContain('Prettier')
    expect(result.stdout.toString()).toContain('Done!')
    expect(result.stderr.toString()).toBe('')
  })

  it('generates angular client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'angular',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('')
    expect(result.stderr.toString()).toBe('')
  })

  it('generates axios client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'axios',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('')
    expect(result.stderr.toString()).toBe('')
  })

  it('generates fetch client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'fetch',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('')
    expect(result.stderr.toString()).toBe('')
  })

  it('generates node client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'node',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('')
    expect(result.stderr.toString()).toBe('')
  })

  it('generates xhr client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'xhr',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('')
    expect(result.stderr.toString()).toBe('')
  })

  it('supports all parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'fetch',
      '--useOptions',
      '--exportCore',
      'true',
      '--exportServices',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('Done!')
    expect(result.stderr.toString()).toBe('')
  })

  it('supports regexp parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--exportServices',
      '^(Simple|Types)',
      '--types',
      '^(Simple|Types)',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain('Done!')
    expect(result.stderr.toString()).toBe('')
  })

  it('formats output with Prettier', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin'
    ])
    expect(result.stdout.toString()).toContain('Prettier')
    expect(result.stderr.toString()).toBe('')
  })

  it('lints output with ESLint', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--lint'
    ])
    expect(result.stdout.toString()).toContain('ESLint')
    expect(result.stderr.toString()).toBe('')
  })

  it('throws error without parameters', () => {
    const result = sync('node', ['./bin/index.cjs', '--dry-run', 'true'])
    expect(result.stdout.toString()).toBe('')
    expect(result.stderr.toString()).toContain('Unexpected error occurred')
  })

  it('throws error with wrong parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--unknown',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toBe('')
    expect(result.stderr.toString()).toContain(
      `error: unknown option '--unknown'`
    )
  })

  it('displays help', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--help',
      '--dry-run',
      'true'
    ])
    expect(result.stdout.toString()).toContain(`Usage: openapi-ts [options]`)
    expect(result.stdout.toString()).toContain(`-i, --input <value>`)
    expect(result.stdout.toString()).toContain(`-o, --output <value>`)
    expect(result.stderr.toString()).toBe('')
  })
})

describe('cli', () => {
  it('handles false booleans', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--debug',
      '--exportCore',
      'false',
      '--types',
      'false',
      '--schemas',
      'false',
      '--exportServices',
      'false',
      '--format',
      'false',
      '--lint',
      'false',
      '--operationId',
      'false',
      '--useDateType',
      'false',
      '--useOptions',
      'false',
      '--dry-run',
      'true'
    ])
    expect(result.stderr.toString()).toContain('debug: true')
    expect(result.stderr.toString()).toContain('dryRun: true')
    expect(result.stderr.toString()).toContain('exportCore: false')
    expect(result.stderr.toString()).toContain('types: false')
    expect(result.stderr.toString()).toContain('exportServices: false')
    expect(result.stderr.toString()).toContain('format: false')
    expect(result.stderr.toString()).toContain('lint: false')
    expect(result.stderr.toString()).toContain('operationId: false')
    expect(result.stderr.toString()).toContain('schemas: false')
    expect(result.stderr.toString()).toContain('useDateType: false')
    expect(result.stderr.toString()).toContain('useOptions: false')
  })

  it('handles true booleans', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--debug',
      '--exportCore',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--exportServices',
      'true',
      '--format',
      'true',
      '--lint',
      'true',
      '--operationId',
      'true',
      '--useDateType',
      'true',
      '--useOptions',
      'true',
      '--dry-run',
      'true'
    ])
    expect(result.stderr.toString()).toContain('debug: true')
    expect(result.stderr.toString()).toContain('dryRun: true')
    expect(result.stderr.toString()).toContain('exportCore: true')
    expect(result.stderr.toString()).toContain('types: true')
    expect(result.stderr.toString()).toContain('exportServices: true')
    expect(result.stderr.toString()).toContain('format: true')
    expect(result.stderr.toString()).toContain('lint: true')
    expect(result.stderr.toString()).toContain('operationId: true')
    expect(result.stderr.toString()).toContain('schemas: true')
    expect(result.stderr.toString()).toContain('useDateType: true')
    expect(result.stderr.toString()).toContain('useOptions: true')
  })

  it('handles optional booleans', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--debug',
      '--exportCore',
      '--types',
      'foo',
      '--schemas',
      '--exportServices',
      'bar',
      '--format',
      '--lint',
      '--operationId',
      '--useDateType',
      '--useOptions',
      '--dry-run',
      'true'
    ])
    expect(result.stderr.toString()).toContain('debug: true')
    expect(result.stderr.toString()).toContain('dryRun: true')
    expect(result.stderr.toString()).toContain('exportCore: true')
    expect(result.stderr.toString()).toContain('format: true')
    expect(result.stderr.toString()).toContain('lint: true')
    expect(result.stderr.toString()).toContain('operationId: true')
    expect(result.stderr.toString()).toContain('schemas: true')
    expect(result.stderr.toString()).toContain('useDateType: true')
    expect(result.stderr.toString()).toContain('useOptions: true')
    expect(result.stderr.toString()).toContain("types: 'foo")
    expect(result.stderr.toString()).toContain("exportServices: 'bar'")
  })
})
