import { describe, expect, it } from 'vitest';

import type { Model, Service } from '~/types/client';

import { sort, sortByName } from '../sort';

describe('sort', () => {
  it('should return correct index', () => {
    expect(sort('a', 'b')).toEqual(-1);
    expect(sort('b', 'a')).toEqual(1);
    expect(sort('a', 'a')).toEqual(0);
    expect(sort('', '')).toEqual(0);
  });
});

describe('sortByName', () => {
  it('should handle empty lists', () => {
    expect(sortByName([])).toEqual([]);
  });

  it('should return sorted list of models', () => {
    const john: Model = {
      $refs: [],
      base: 'John',
      description: null,
      enum: [],
      enums: [],
      export: 'interface',
      imports: [],
      in: '',
      isDefinition: true,
      isNullable: false,
      isReadOnly: false,
      isRequired: false,
      link: null,
      name: 'John',
      properties: [],
      template: null,
      type: 'John',
    };
    const jane: Model = {
      $refs: [],
      base: 'Jane',
      description: null,
      enum: [],
      enums: [],
      export: 'interface',
      imports: [],
      in: '',
      isDefinition: true,
      isNullable: false,
      isReadOnly: false,
      isRequired: false,
      link: null,
      name: 'Jane',
      properties: [],
      template: null,
      type: 'Jane',
    };
    const doe: Model = {
      $refs: [],
      base: 'Doe',
      description: null,
      enum: [],
      enums: [],
      export: 'interface',
      imports: [],
      in: '',
      isDefinition: true,
      isNullable: false,
      isReadOnly: false,
      isRequired: false,
      link: null,
      name: 'Doe',
      properties: [],
      template: null,
      type: 'Doe',
    };
    const models: Model[] = [john, jane, doe];
    expect(sortByName(models)).toEqual([doe, jane, john]);
  });

  it('should return sorted list of services', () => {
    const john: Service = {
      $refs: [],
      imports: [],
      name: 'John',
      operations: [],
    };
    const jane: Service = {
      $refs: [],
      imports: [],
      name: 'Jane',
      operations: [],
    };
    const doe: Service = {
      $refs: [],
      imports: [],
      name: 'Doe',
      operations: [],
    };
    const services: Service[] = [john, jane, doe];
    expect(sortByName(services)).toEqual([doe, jane, john]);
  });

  it('should throw errors when trying to sort without a name entry', () => {
    const values = ['some', 'string', 'array'];
    // @ts-expect-error
    expect(() => sortByName(values)).toThrow(TypeError);
  });
});
