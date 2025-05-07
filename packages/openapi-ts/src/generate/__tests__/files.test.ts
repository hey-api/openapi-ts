import { describe, expect, it } from 'vitest';

import { _test } from '../files';

const { ensureUniqueIdentifier, parseRefPath, splitNameAndExtension } = _test;

describe('parseRefPath', () => {
  it('should parse simple ref without properties', () => {
    const ref = '#/components/schemas/User';
    const result = parseRefPath(ref);
    expect(result).toEqual({
      baseRef: '#/components/schemas/User',
      name: 'User',
      properties: [],
    });
  });

  it('should parse ref with single property', () => {
    const ref = '#/components/schemas/User/properties/name';
    const result = parseRefPath(ref);
    expect(result).toEqual({
      baseRef: '#/components/schemas/User',
      name: 'User',
      properties: ['name'],
    });
  });

  it('should parse ref with multiple properties', () => {
    const ref = '#/components/schemas/User/properties/address/properties/city';
    const result = parseRefPath(ref);
    expect(result).toEqual({
      baseRef: '#/components/schemas/User',
      name: 'User',
      properties: ['address', 'city'],
    });
  });

  it('should handle ref with empty name', () => {
    const ref = '#/components/schemas/';
    const result = parseRefPath(ref);
    expect(result).toEqual({
      baseRef: '#/components/schemas/',
      name: '',
      properties: [],
    });
  });

  it('should throw error for invalid ref with empty property', () => {
    const ref = '#/components/schemas/User/properties/';
    expect(() => parseRefPath(ref)).toThrow('Invalid $ref: ' + ref);
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
    const result = ensureUniqueIdentifier({
      $ref: '#/components/',
      case: 'camelCase',
      namespace: {},
    });

    expect(result).toEqual({
      created: false,
      name: '',
    });
  });

  it('returns existing name from namespace when ref exists', () => {
    const namespace = {
      '#/components/User': { $ref: '#/components/User', name: 'User' },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      namespace,
    });

    expect(result).toEqual({
      created: false,
      name: 'User',
    });
  });

  it('handles nested properties in ref', () => {
    const namespace = {
      '#/components/User': { $ref: '#/components/User', name: 'User' },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User/properties/id',
      case: 'camelCase',
      namespace,
    });

    expect(result).toEqual({
      created: false,
      name: "User['id']",
    });
  });

  it('applies nameTransformer and case transformation', () => {
    const namespace = {};
    const nameTransformer = (name: string) => `prefix${name}`;

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: true,
      nameTransformer,
      namespace,
    });

    expect(result).toEqual({
      created: true,
      name: 'prefixUser',
    });
    expect(namespace).toHaveProperty('prefixUser', {
      $ref: '#/components/User',
      name: 'prefixUser',
    });
  });

  it('resolves naming conflicts by appending count', () => {
    const namespace = {
      user: { $ref: '#/components/Other', name: 'user' },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: true,
      namespace,
    });

    expect(result).toEqual({
      created: true,
      name: 'user2',
    });
    expect(namespace).toHaveProperty('user2', {
      $ref: '#/components/User',
      name: 'user2',
    });
  });

  it('returns existing name when ref matches in namespace', () => {
    const namespace = {
      '#/components/User': { $ref: '#/components/User', name: 'user' },
      user: { $ref: '#/components/User', name: 'user' },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      namespace,
    });

    expect(result).toEqual({
      created: false,
      name: 'user',
    });
  });

  it('does not create new entry when create is false', () => {
    const namespace = {};

    const result = ensureUniqueIdentifier({
      $ref: '#/components/User',
      case: 'camelCase',
      create: false,
      namespace,
    });

    expect(result).toEqual({
      created: false,
      name: '',
    });
    expect(namespace).toEqual({});
  });

  it('returns existing identifier if name collision matches same baseRef', () => {
    const namespace: any = {
      User: { $ref: '#/components/schemas/User', name: 'User' },
    };

    const result = ensureUniqueIdentifier({
      $ref: '#/components/schemas/User',
      case: 'PascalCase',
      create: true,
      namespace,
    });

    expect(result).toEqual({ created: false, name: 'User' });
  });
});
