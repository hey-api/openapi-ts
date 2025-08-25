import { describe, expect, it } from 'vitest';

import { _test, splitNameAndExtension } from '../index';
import type { Identifiers } from '../types';

const { ensureUniqueIdentifier, parseRef } = _test;

describe('parseRef', () => {
  it('should parse simple ref without properties', () => {
    const ref = '#/components/schemas/User';
    const result = parseRef(ref);
    expect(result).toEqual({
      name: 'User',
      properties: [],
      ref: '#/components/schemas/User',
    });
  });

  it('should parse ref with single property', () => {
    const ref = '#/components/schemas/User/properties/name';
    const result = parseRef(ref);
    expect(result).toEqual({
      name: 'User',
      properties: ['name'],
      ref: '#/components/schemas/User',
    });
  });

  it('should parse ref with multiple properties', () => {
    const ref = '#/components/schemas/User/properties/address/properties/city';
    const result = parseRef(ref);
    expect(result).toEqual({
      name: 'User',
      properties: ['address', 'city'],
      ref: '#/components/schemas/User',
    });
  });

  it('should handle ref with empty name', () => {
    const ref = '#/components/schemas/';
    const result = parseRef(ref);
    expect(result).toEqual({
      name: '',
      properties: [],
      ref: '#/components/schemas/',
    });
  });

  it('should throw error for invalid ref with empty property', () => {
    const ref = '#/components/schemas/User/properties/';
    expect(() => parseRef(ref)).toThrow('Invalid $ref: ' + ref);
  });
});

describe('splitNameAndExtension', () => {
  it('should split filename with extension correctly', () => {
    const result = splitNameAndExtension('document.pdf');
    expect(result).toEqual({ extension: 'pdf', name: 'document' });
  });

  it('should handle filename without extension', () => {
    const result = splitNameAndExtension('README');
    expect(result).toEqual({ extension: '', name: 'README' });
  });

  it('should handle filename with multiple dots', () => {
    const result = splitNameAndExtension('my.file.name.txt');
    expect(result).toEqual({ extension: 'txt', name: 'my.file.name' });
  });

  it('should handle empty string', () => {
    const result = splitNameAndExtension('');
    expect(result).toEqual({ extension: '', name: '' });
  });

  it('should handle filename with uppercase extension', () => {
    const result = splitNameAndExtension('image.PNG');
    expect(result).toEqual({ extension: 'PNG', name: 'image' });
  });

  it('should handle extension with numbers', () => {
    const result = splitNameAndExtension('video.mp4');
    expect(result).toEqual({ extension: 'mp4', name: 'video' });
  });
});

describe('ensureUniqueIdentifier', () => {
  it('returns empty name when no name is parsed from ref', () => {
    const identifiers: Identifiers = {};

    const result = ensureUniqueIdentifier({
      $ref: '#/components/',
      case: 'camelCase',
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: false,
      name: '',
    });
  });

  it('returns existing name from namespace when ref exists', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          '#/components/User': { $ref: '#/components/User', name: 'User' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: false,
      name: 'User',
    });
  });

  it('handles nested properties in ref', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          '#/components/User': { $ref: '#/components/User', name: 'User' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User/properties/id',
      case: 'camelCase',
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: false,
      name: "User['id']",
    });
  });

  it('applies nameTransformer and case transformation', () => {
    const nameTransformer = (name: string) => `prefix${name}`;
    const identifiers: Identifiers = {
      user: {
        type: {},
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: true,
      identifiers,
      nameTransformer,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: true,
      name: 'prefixUser',
    });
    expect(identifiers).toHaveProperty('prefixuser', {
      type: {
        '#/components/User': {
          $ref: '#/components/User',
          name: 'prefixUser',
        },
        prefixUser: {
          $ref: '#/components/User',
          name: 'prefixUser',
        },
      },
    });
  });

  it('resolves naming conflicts by appending count', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          user: { $ref: '#/components/Other', name: 'user' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: true,
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: true,
      name: 'user2',
    });
    expect(identifiers).toHaveProperty('user2', {
      type: {
        '#/components/User': {
          $ref: '#/components/User',
          name: 'user2',
        },
        user2: {
          $ref: '#/components/User',
          name: 'user2',
        },
      },
    });
  });

  it('resolves naming conflicts with name transformer by appending count', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          user: { $ref: '#/components/Other', name: 'user' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/Foo',
      case: 'camelCase',
      create: true,
      identifiers,
      nameTransformer: () => 'user',
      namespace: 'type',
    });

    expect(result).toEqual({
      created: true,
      name: 'user2',
    });
    expect(identifiers).toHaveProperty('user2', {
      type: {
        '#/components/Foo': {
          $ref: '#/components/Foo',
          name: 'user2',
        },
        user2: {
          $ref: '#/components/Foo',
          name: 'user2',
        },
      },
    });
  });

  it('returns existing name when ref matches in namespace', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          '#/components/User': { $ref: '#/components/User', name: 'user' },
          user: { $ref: '#/components/User', name: 'user' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: false,
      name: 'user',
    });
  });

  it('does not create new entry when create is false', () => {
    const identifiers: Identifiers = {};

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: false,
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({
      created: false,
      name: '',
    });
    expect(identifiers).toEqual({
      user: {},
    });
  });

  it('returns existing identifier if name collision matches same ref', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          User: { $ref: '#/components/schemas/User', name: 'User' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/schemas/User',
      case: 'PascalCase',
      create: true,
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({ created: false, name: 'User' });
  });

  it('creates a new identifier for enum if name collision matches non-enum', () => {
    const identifiers: Identifiers = {
      user: {
        type: {
          User: { $ref: '#/components/schemas/User', name: 'User' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/schemas/User',
      case: 'PascalCase',
      create: true,
      identifiers,
      namespace: 'enum',
    });

    expect(result).toEqual({ created: true, name: 'User2' });
    expect(identifiers).toHaveProperty('user2', {
      enum: {
        '#/components/schemas/User': {
          $ref: '#/components/schemas/User',
          name: 'User2',
        },
        User2: {
          $ref: '#/components/schemas/User',
          name: 'User2',
        },
      },
    });
  });

  it('creates a new identifier for non-enum if name collision matches enum', () => {
    const identifiers: Identifiers = {
      user: {
        enum: {
          User: { $ref: '#/components/schemas/User', name: 'User' },
        },
      },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/schemas/User',
      case: 'PascalCase',
      create: true,
      identifiers,
      namespace: 'type',
    });

    expect(result).toEqual({ created: true, name: 'User2' });
    expect(identifiers).toHaveProperty('user2', {
      type: {
        '#/components/schemas/User': {
          $ref: '#/components/schemas/User',
          name: 'User2',
        },
        User2: {
          $ref: '#/components/schemas/User',
          name: 'User2',
        },
      },
    });
  });
});
