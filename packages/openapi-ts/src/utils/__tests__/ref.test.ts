import { describe, expect, it } from 'vitest';

import {
  isTopLevelComponentRef,
  jsonPointerToPath,
  pathToJsonPointer,
} from '../ref';

describe('jsonPointerToPath', () => {
  it('parses root pointer', () => {
    expect(jsonPointerToPath('#')).toEqual([]);
    expect(jsonPointerToPath('')).toEqual([]);
  });

  it('parses component ref', () => {
    expect(jsonPointerToPath('#/components/schemas/Foo')).toEqual([
      'components',
      'schemas',
      'Foo',
    ]);
  });

  it('parses deep path ref', () => {
    expect(
      jsonPointerToPath('#/components/schemas/Foo/properties/bar/items'),
    ).toEqual(['components', 'schemas', 'Foo', 'properties', 'bar', 'items']);
  });
});

describe('pathToJsonPointer', () => {
  it('converts empty path to root pointer', () => {
    expect(pathToJsonPointer([])).toBe('#');
  });

  it('converts path to pointer', () => {
    expect(pathToJsonPointer(['components', 'schemas', 'Foo'])).toBe(
      '#/components/schemas/Foo',
    );
  });
});

describe('isTopLevelComponentRef', () => {
  describe('OpenAPI 3.x refs', () => {
    it('returns true for top-level component refs', () => {
      expect(isTopLevelComponentRef('#/components/schemas/Foo')).toBe(true);
      expect(isTopLevelComponentRef('#/components/parameters/Bar')).toBe(true);
      expect(isTopLevelComponentRef('#/components/responses/Error')).toBe(true);
      expect(isTopLevelComponentRef('#/components/requestBodies/Body')).toBe(
        true,
      );
    });

    it('returns false for deep path refs', () => {
      expect(
        isTopLevelComponentRef('#/components/schemas/Foo/properties/bar'),
      ).toBe(false);
      expect(
        isTopLevelComponentRef('#/components/schemas/Foo/properties/bar/items'),
      ).toBe(false);
      expect(isTopLevelComponentRef('#/components/schemas/Foo/allOf/0')).toBe(
        false,
      );
    });
  });

  describe('OpenAPI 2.0 refs', () => {
    it('returns true for top-level definitions refs', () => {
      expect(isTopLevelComponentRef('#/definitions/Foo')).toBe(true);
      expect(isTopLevelComponentRef('#/definitions/Bar')).toBe(true);
    });

    it('returns false for deep path refs', () => {
      expect(isTopLevelComponentRef('#/definitions/Foo/properties/bar')).toBe(
        false,
      );
      expect(
        isTopLevelComponentRef('#/definitions/Foo/properties/bar/items'),
      ).toBe(false);
    });
  });

  describe('non-component refs', () => {
    it('returns false for path refs', () => {
      expect(isTopLevelComponentRef('#/paths/~1users/get')).toBe(false);
    });

    it('returns false for other refs', () => {
      expect(isTopLevelComponentRef('#/info/title')).toBe(false);
    });
  });
});
