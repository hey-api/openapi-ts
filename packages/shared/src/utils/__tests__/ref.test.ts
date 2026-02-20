import {
  hasPropertyInSchemaRefChain,
  isTopLevelComponent,
  jsonPointerToPath,
  pathToJsonPointer,
} from '../ref';

describe('jsonPointerToPath', () => {
  it('parses root pointer', () => {
    expect(jsonPointerToPath('#')).toEqual([]);
    expect(jsonPointerToPath('')).toEqual([]);
  });

  it('parses component ref', () => {
    expect(jsonPointerToPath('#/components/schemas/Foo')).toEqual(['components', 'schemas', 'Foo']);
  });

  it('parses deep path ref', () => {
    expect(jsonPointerToPath('#/components/schemas/Foo/properties/bar/items')).toEqual([
      'components',
      'schemas',
      'Foo',
      'properties',
      'bar',
      'items',
    ]);
  });
});

describe('pathToJsonPointer', () => {
  it('converts empty path to root pointer', () => {
    expect(pathToJsonPointer([])).toBe('#');
  });

  it('converts path to pointer', () => {
    expect(pathToJsonPointer(['components', 'schemas', 'Foo'])).toBe('#/components/schemas/Foo');
  });
});

describe('isTopLevelComponent', () => {
  describe('OpenAPI 3.x refs', () => {
    it('returns true for top-level component refs', () => {
      expect(isTopLevelComponent('#/components/schemas/Foo')).toBe(true);
      expect(isTopLevelComponent('#/components/parameters/Bar')).toBe(true);
      expect(isTopLevelComponent('#/components/responses/Error')).toBe(true);
      expect(isTopLevelComponent('#/components/requestBodies/Body')).toBe(true);
    });

    it('returns false for deep path refs', () => {
      expect(isTopLevelComponent('#/components/schemas/Foo/properties/bar')).toBe(false);
      expect(isTopLevelComponent('#/components/schemas/Foo/properties/bar/items')).toBe(false);
      expect(isTopLevelComponent('#/components/schemas/Foo/allOf/0')).toBe(false);
    });
  });

  describe('OpenAPI 2.0 refs', () => {
    it('returns true for top-level definitions refs', () => {
      expect(isTopLevelComponent('#/definitions/Foo')).toBe(true);
      expect(isTopLevelComponent('#/definitions/Bar')).toBe(true);
    });

    it('returns false for deep path refs', () => {
      expect(isTopLevelComponent('#/definitions/Foo/properties/bar')).toBe(false);
      expect(isTopLevelComponent('#/definitions/Foo/properties/bar/items')).toBe(false);
    });
  });

  describe('non-component refs', () => {
    it('returns false for path refs', () => {
      expect(isTopLevelComponent('#/paths/~1users/get')).toBe(false);
    });

    it('returns false for other refs', () => {
      expect(isTopLevelComponent('#/info/title')).toBe(false);
    });
  });
});

describe('hasPropertyInSchemaRefChain', () => {
  it('finds property in deep allOf and ref chain', () => {
    const spec = {
      components: {
        schemas: {
          BaseEntity: {
            properties: {
              id: {
                type: 'string',
              },
            },
            type: 'object',
          },
          DiscriminatorCarrier: {
            allOf: [
              {
                $ref: '#/components/schemas/BaseEntity',
              },
              {
                properties: {
                  kind: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
            ],
          },
          Leaf: {
            allOf: [
              {
                $ref: '#/components/schemas/MidLevel',
              },
            ],
          },
          MidLevel: {
            allOf: [
              {
                $ref: '#/components/schemas/DiscriminatorCarrier',
              },
            ],
          },
        },
      },
    };

    expect(
      hasPropertyInSchemaRefChain({
        propertyName: 'kind',
        resolveRef: ($ref) => {
          const name = $ref.split('/').pop()!;
          return spec.components.schemas[name as keyof typeof spec.components.schemas] as {
            allOf?: ReadonlyArray<{ $ref: string } | { properties?: Record<string, unknown> }>;
            properties?: Record<string, unknown>;
          };
        },
        schema: {
          $ref: '#/components/schemas/Leaf',
        },
      }),
    ).toBe(true);
  });

  it('finds property in a single-level ref schema', () => {
    const spec = {
      components: {
        schemas: {
          SingleLevel: {
            properties: {
              discriminator: {
                type: 'string',
              },
            },
            type: 'object',
          },
        },
      },
    };

    expect(
      hasPropertyInSchemaRefChain({
        propertyName: 'discriminator',
        resolveRef: ($ref) => {
          const name = $ref.split('/').pop()!;
          return spec.components.schemas[name as keyof typeof spec.components.schemas] as {
            allOf?: ReadonlyArray<{ $ref: string } | { properties?: Record<string, unknown> }>;
            properties?: Record<string, unknown>;
          };
        },
        schema: {
          $ref: '#/components/schemas/SingleLevel',
        },
      }),
    ).toBe(true);
  });
});

describe('hasPropertyInSchemaRefChain', () => {
  it('finds property in deep allOf and ref chain', () => {
    const spec = {
      components: {
        schemas: {
          BaseEntity: {
            properties: {
              id: {
                type: 'string',
              },
            },
            type: 'object',
          },
          DiscriminatorCarrier: {
            allOf: [
              {
                $ref: '#/components/schemas/BaseEntity',
              },
              {
                properties: {
                  kind: {
                    type: 'string',
                  },
                },
                type: 'object',
              },
            ],
          },
          Leaf: {
            allOf: [
              {
                $ref: '#/components/schemas/MidLevel',
              },
            ],
          },
          MidLevel: {
            allOf: [
              {
                $ref: '#/components/schemas/DiscriminatorCarrier',
              },
            ],
          },
        },
      },
    };

    expect(
      hasPropertyInSchemaRefChain({
        propertyName: 'kind',
        resolveRef: ($ref) => {
          const name = $ref.split('/').pop()!;
          return spec.components.schemas[name as keyof typeof spec.components.schemas] as {
            allOf?: ReadonlyArray<{ $ref: string } | { properties?: Record<string, unknown> }>;
            properties?: Record<string, unknown>;
          };
        },
        schema: {
          $ref: '#/components/schemas/Leaf',
        },
      }),
    ).toBe(true);
  });

  it('finds property in a single-level ref schema', () => {
    const spec = {
      components: {
        schemas: {
          SingleLevel: {
            properties: {
              discriminator: {
                type: 'string',
              },
            },
            type: 'object',
          },
        },
      },
    };

    expect(
      hasPropertyInSchemaRefChain({
        propertyName: 'discriminator',
        resolveRef: ($ref) => {
          const name = $ref.split('/').pop()!;
          return spec.components.schemas[name as keyof typeof spec.components.schemas] as {
            allOf?: ReadonlyArray<{ $ref: string } | { properties?: Record<string, unknown> }>;
            properties?: Record<string, unknown>;
          };
        },
        schema: {
          $ref: '#/components/schemas/SingleLevel',
        },
      }),
    ).toBe(true);
  });
});
