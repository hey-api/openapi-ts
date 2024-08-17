import { describe, expect, it, type MockedFunction, vi } from 'vitest';

import type { Config } from '../../../../types/config';
import { isStandaloneClient } from '../../../../utils/config';
import { getMappedType, getType, transformTypeKeyName } from '../type';

vi.mock('../../../../utils/config', () => {
  const config: Partial<Config> = {
    types: {},
  };
  return {
    getConfig: () => config,
    isStandaloneClient: vi.fn().mockReturnValue(false),
  };
});

describe('getMappedType', () => {
  it.each([
    { expected: 'binary', type: 'file' },
    { expected: 'boolean', type: 'boolean' },
    { expected: 'null', type: 'null' },
    { expected: 'number', type: 'byte' },
    { expected: 'number', type: 'double' },
    { expected: 'number', type: 'float' },
    { expected: 'number', type: 'int' },
    { expected: 'number', type: 'integer' },
    { expected: 'number', type: 'long' },
    { expected: 'number', type: 'number' },
    { expected: 'number', type: 'short' },
    { expected: 'string', type: 'char' },
    { expected: 'string', type: 'date-time' },
    { expected: 'string', type: 'date' },
    { expected: 'string', type: 'password' },
    { expected: 'string', type: 'string' },
    { expected: 'unknown', type: 'any' },
    { expected: 'unknown', type: 'object' },
    { expected: 'unknown', type: 'unknown' },
    { expected: 'unknown[]', type: 'array' },
    { expected: 'void', type: 'void' },
    { expected: undefined, type: '' },
  ])('should map type $type to $expected', ({ type, expected }) => {
    expect(getMappedType(type)).toEqual(expected);
  });
});

describe('getType', () => {
  it('should convert int', () => {
    const type = getType({ type: 'int' });
    expect(type.type).toEqual('number');
    expect(type.base).toEqual('number');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual([]);
    expect(type.isNullable).toEqual(false);
  });

  it('should convert string', () => {
    const type = getType({ type: 'string' });
    expect(type.type).toEqual('string');
    expect(type.base).toEqual('string');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual([]);
    expect(type.isNullable).toEqual(false);
  });

  it('should convert string array', () => {
    const type = getType({ type: 'array[string]' });
    expect(type.type).toEqual('string[]');
    expect(type.base).toEqual('string');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual([]);
    expect(type.isNullable).toEqual(false);
  });

  it('should convert template with primary', () => {
    const type = getType({ type: '#/components/schemas/Link[string]' });
    expect(type.type).toEqual('Link<string>');
    expect(type.base).toEqual('Link');
    expect(type.template).toEqual('string');
    expect(type.imports).toEqual(['Link']);
    expect(type.isNullable).toEqual(false);
  });

  it('should convert template with model', () => {
    const type = getType({ type: '#/components/schemas/Link[Model]' });
    expect(type.type).toEqual('Link<Model>');
    expect(type.base).toEqual('Link');
    expect(type.template).toEqual('Model');
    expect(type.imports).toEqual(['Link', 'Model']);
    expect(type.isNullable).toEqual(false);
  });

  it('should have double imports', () => {
    const type = getType({ type: '#/components/schemas/Link[Link]' });
    expect(type.type).toEqual('Link<Link>');
    expect(type.base).toEqual('Link');
    expect(type.template).toEqual('Link');
    expect(type.imports).toEqual(['Link', 'Link']);
    expect(type.isNullable).toEqual(false);
  });

  it('should support dot', () => {
    const type = getType({ type: '#/components/schemas/model.000' });
    expect(type.type).toEqual('model_000');
    expect(type.base).toEqual('model_000');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual(['model_000']);
    expect(type.isNullable).toEqual(false);
  });

  it('should support dashes', () => {
    const type = getType({ type: '#/components/schemas/some_special-schema' });
    expect(type.type).toEqual('some_special_schema');
    expect(type.base).toEqual('some_special_schema');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual(['some_special_schema']);
    expect(type.isNullable).toEqual(false);
  });

  it('should support dollar sign', () => {
    const type = getType({ type: '#/components/schemas/$some+special+schema' });
    expect(type.type).toEqual('$some_special_schema');
    expect(type.base).toEqual('$some_special_schema');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual(['$some_special_schema']);
    expect(type.isNullable).toEqual(false);
  });

  it('should support multiple base types', () => {
    const type = getType({ type: ['string', 'int'] });
    expect(type.type).toEqual('string | number');
    expect(type.base).toEqual('string | number');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual([]);
    expect(type.isNullable).toEqual(false);
  });

  it('should support multiple nullable types', () => {
    const type = getType({ type: ['string', 'null'] });
    expect(type.type).toEqual('string');
    expect(type.base).toEqual('string');
    expect(type.template).toEqual(null);
    expect(type.imports).toEqual([]);
    expect(type.isNullable).toEqual(true);
  });
});

describe('transformTypeKeyName', () => {
  describe('legacy client', () => {
    it.each([
      { expected: '', input: '' },
      { expected: 'foobar', input: 'foobar' },
      { expected: 'fooBar', input: 'fooBar' },
      { expected: 'fooBar', input: 'foo_bar' },
      { expected: 'fooBar', input: 'foo-bar' },
      { expected: 'fooBar', input: 'foo.bar' },
      { expected: 'fooBar', input: '@foo.bar' },
      { expected: 'fooBar', input: '$foo.bar' },
      { expected: 'fooBar', input: '123.foo.bar' },
      { expected: 'fooBar', input: 'Foo-Bar' },
      { expected: 'fooBar', input: 'FOO-BAR' },
      { expected: 'fooBar', input: 'foo[bar]' },
      { expected: 'fooBarArray', input: 'foo.bar[]' },
    ])('$input -> $expected', ({ input, expected }) => {
      (isStandaloneClient as MockedFunction<any>).mockImplementationOnce(
        () => false,
      );
      expect(transformTypeKeyName(input)).toBe(expected);
    });
  });

  describe('standalone client', () => {
    it.each([
      { expected: '', input: '' },
      { expected: 'foobar', input: 'foobar' },
      { expected: 'fooBar', input: 'fooBar' },
      { expected: 'fooBar', input: 'foo_bar' },
      { expected: 'fooBar', input: 'foo-bar' },
      { expected: 'fooBar', input: 'foo.bar' },
      { expected: 'fooBar', input: '@foo.bar' },
      { expected: 'fooBar', input: '$foo.bar' },
      { expected: 'fooBar', input: '123.foo.bar' },
      { expected: 'fooBar', input: 'Foo-Bar' },
      { expected: 'fooBar', input: 'FOO-BAR' },
      { expected: 'fooBar', input: 'foo[bar]' },
      { expected: 'fooBarArray', input: 'foo.bar[]' },
    ])('$input -> $input', ({ input }) => {
      (isStandaloneClient as MockedFunction<any>).mockImplementationOnce(
        () => true,
      );
      expect(transformTypeKeyName(input)).toBe(input);
    });
  });
});
