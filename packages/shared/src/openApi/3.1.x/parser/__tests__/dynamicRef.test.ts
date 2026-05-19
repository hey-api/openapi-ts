import { describe, expect, it, vi } from 'vitest';

import {
  buildCurrentDynamicScope,
  buildDynamicScope,
  buildGenericRef,
  containsRefTo,
  getDynamicDefsBindings,
  getTemplateParams,
  hasDynamicRefBindings,
  materializeDynamicRefBinding,
  resolveDynamicRef,
  shouldInlineDynamicRefTarget,
} from '../dynamicRef';

describe('hasDynamicRefBindings', () => {
  it('returns false when schema has no $defs', () => {
    expect(hasDynamicRefBindings({ type: 'object' })).toBe(false);
  });

  it('returns false when $defs is empty', () => {
    expect(hasDynamicRefBindings({ $defs: {} })).toBe(false);
  });

  it('returns false when $defs entry has $dynamicAnchor but no $ref', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            properties: { id: { type: 'string' } },
            type: 'object',
          },
        },
      }),
    ).toBe(false);
  });

  it('returns false when $defs entry has $ref but no $dynamicAnchor', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          itemType: {
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toBe(false);
  });

  it('returns true when $defs entry has both $dynamicAnchor and $ref', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toBe(true);
  });

  it('returns true when at least one $defs entry has both', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          noAnchor: { type: 'string' },
          noRef: { $dynamicAnchor: 'x' },
          valid: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toBe(true);
  });

  it('ignores non-object $defs entries', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          a: null as any,
          b: 'string' as any,
          c: 42 as any,
          d: true as any,
        },
      }),
    ).toBe(false);
  });

  it('ignores array $defs entries', () => {
    expect(
      hasDynamicRefBindings({
        $defs: {
          a: [{ type: 'string' }] as any,
        },
      }),
    ).toBe(false);
  });
});

describe('buildDynamicScope', () => {
  it('returns empty scope for plain schema', () => {
    expect(buildDynamicScope({ type: 'object' })).toEqual({});
  });

  it('records own $dynamicAnchor with $ref', () => {
    expect(
      buildDynamicScope({
        $dynamicAnchor: 'itemType',
        $ref: '#/components/schemas/User',
      }),
    ).toEqual({ itemType: '#/components/schemas/User' });
  });

  it('records own $dynamicAnchor with schemaRef fallback', () => {
    expect(
      buildDynamicScope({ $dynamicAnchor: 'category' }, '#/components/schemas/BaseCategory'),
    ).toEqual({ category: '#/components/schemas/BaseCategory' });
  });

  it('does not record $dynamicAnchor when no $ref or schemaRef', () => {
    expect(buildDynamicScope({ $dynamicAnchor: 'itemType' })).toEqual({});
  });

  it('prefers $ref over schemaRef', () => {
    expect(
      buildDynamicScope(
        {
          $dynamicAnchor: 'itemType',
          $ref: '#/components/schemas/User',
        },
        '#/components/schemas/Fallback',
      ),
    ).toEqual({ itemType: '#/components/schemas/User' });
  });

  it('records $defs bindings', () => {
    expect(
      buildDynamicScope({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toEqual({ itemType: '#/components/schemas/User' });
  });

  it('skips $defs entries without both $dynamicAnchor and $ref', () => {
    expect(
      buildDynamicScope({
        $defs: {
          a: { $dynamicAnchor: 'a' },
          b: { $ref: '#/components/schemas/User' },
          c: { type: 'string' },
        },
      }),
    ).toEqual({});
  });

  it('combines own anchor and $defs bindings', () => {
    expect(
      buildDynamicScope({
        $defs: {
          other: {
            $dynamicAnchor: 'other',
            $ref: '#/components/schemas/Other',
          },
        },
        $dynamicAnchor: 'self',
        $ref: '#/components/schemas/Self',
      }),
    ).toEqual({
      other: '#/components/schemas/Other',
      self: '#/components/schemas/Self',
    });
  });

  it('ignores non-object $defs entries', () => {
    expect(
      buildDynamicScope({
        $defs: {
          a: null as any,
          b: 'string' as any,
          c: [{ type: 'string' }] as any,
        },
      }),
    ).toEqual({});
  });
});

describe('buildCurrentDynamicScope', () => {
  it('returns own scope when no inherited scope', () => {
    expect(
      buildCurrentDynamicScope({
        schema: {
          $dynamicAnchor: 'itemType',
          $ref: '#/components/schemas/User',
        },
      }),
    ).toEqual({ itemType: '#/components/schemas/User' });
  });

  it('merges own scope with inherited', () => {
    expect(
      buildCurrentDynamicScope({
        inheritedScope: { parent: '#/components/schemas/Parent' },
        schema: {
          $dynamicAnchor: 'child',
          $ref: '#/components/schemas/Child',
        },
      }),
    ).toEqual({
      child: '#/components/schemas/Child',
      parent: '#/components/schemas/Parent',
    });
  });

  it('inherited (outer) scope wins for same key per JSON Schema 2020-12 §8.2.3.2', () => {
    expect(
      buildCurrentDynamicScope({
        inheritedScope: { itemType: '#/components/schemas/Parent' },
        schema: {
          $dynamicAnchor: 'itemType',
          $ref: '#/components/schemas/Child',
        },
      }),
    ).toEqual({ itemType: '#/components/schemas/Parent' });
  });

  it('returns empty scope for plain schema with no inherited', () => {
    expect(buildCurrentDynamicScope({ schema: { type: 'object' } })).toEqual({});
  });

  it('returns only inherited scope when schema has no dynamic bindings', () => {
    expect(
      buildCurrentDynamicScope({
        inheritedScope: { itemType: '#/components/schemas/User' },
        schema: { type: 'object' },
      }),
    ).toEqual({ itemType: '#/components/schemas/User' });
  });
});

describe('resolveDynamicRef', () => {
  it('resolves plain anchor name', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#itemType',
        dynamicScope: { itemType: '#/components/schemas/User' },
      }),
    ).toBe('#/components/schemas/User');
  });

  it('returns undefined for external ref', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: 'other.json#node',
        dynamicScope: { node: '#/components/schemas/X' },
      }),
    ).toBeUndefined();
  });

  it('returns undefined for JSON pointer fragment', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#/defs/itemType',
        dynamicScope: { '/defs/itemType': '#/components/schemas/X' },
      }),
    ).toBeUndefined();
  });

  it('returns undefined for non-# ref', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: 'itemType',
        dynamicScope: { itemType: '#/components/schemas/User' },
      }),
    ).toBeUndefined();
  });

  it('returns undefined when no scope', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#itemType',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when anchor not in scope', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#missing',
        dynamicScope: { itemType: '#/components/schemas/User' },
      }),
    ).toBeUndefined();
  });

  it('returns undefined for bare #', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#',
      }),
    ).toBeUndefined();
  });

  it('returns undefined for bare # even with empty-string scope key', () => {
    expect(
      resolveDynamicRef({
        dynamicRef: '#',
        dynamicScope: { '': '#/components/schemas/X' },
      }),
    ).toBeUndefined();
  });
});

describe('materializeDynamicRefBinding', () => {
  const mockResolveRef = vi.fn();

  const createContext = () =>
    ({
      resolveRef: mockResolveRef,
    }) as any;

  beforeEach(() => {
    mockResolveRef.mockReset();
  });

  it('returns undefined when schema has no $ref', () => {
    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: { type: 'object' },
    });
    expect(result).toBeUndefined();
  });

  it('returns undefined when schema has no $defs', () => {
    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: { $ref: '#/components/schemas/Template' },
    });
    expect(result).toBeUndefined();
  });

  it('returns undefined when $defs has no dynamic ref bindings', () => {
    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: {
        $defs: {
          a: { type: 'string' },
        },
        $ref: '#/components/schemas/Template',
      },
    });
    expect(result).toBeUndefined();
  });

  it('returns undefined when $ref is not a top-level component', () => {
    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: {
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
        $ref: '#/properties/foo',
      },
    });
    expect(result).toBeUndefined();
  });

  it('materializes when all conditions are met', () => {
    mockResolveRef.mockReturnValue({
      properties: {
        items: {
          items: { $dynamicRef: '#itemType' },
          type: 'array',
        },
        total: { type: 'integer' },
      },
      type: 'object',
    });

    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: {
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
        $ref: '#/components/schemas/PaginatedTemplate',
      },
    });

    expect(result).toBeDefined();
    expect((result as any).$ref).toBeUndefined();
    expect((result as any).$dynamicAnchor).toBeUndefined();
    expect((result as any).$id).toBeUndefined();
    expect(result!.type).toBe('object');
    expect(result!.$defs).toBeDefined();
    expect(mockResolveRef).toHaveBeenCalledWith('#/components/schemas/PaginatedTemplate');
  });

  it('caller schema properties override refSchema', () => {
    mockResolveRef.mockReturnValue({
      description: 'original',
      type: 'object',
    });

    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: {
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
        $ref: '#/components/schemas/Template',
        description: 'overridden',
      },
    });

    expect(result!.description).toBe('overridden');
  });

  it('merges $defs from refSchema and caller schema', () => {
    mockResolveRef.mockReturnValue({
      $defs: {
        helper: { type: 'string' },
        placeholder: { $dynamicAnchor: 'itemType', not: {} },
      },
      type: 'object',
    });

    const result = materializeDynamicRefBinding({
      context: createContext(),
      schema: {
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
        $ref: '#/components/schemas/Template',
      },
    });

    expect(result!.$defs).toEqual({
      helper: { type: 'string' },
      itemType: {
        $dynamicAnchor: 'itemType',
        $ref: '#/components/schemas/User',
      },
      placeholder: { $dynamicAnchor: 'itemType', not: {} },
    });
  });
});

describe('shouldInlineDynamicRefTarget', () => {
  it('returns true when all conditions are met', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: {
          $dynamicAnchor: 'itemType',
          type: 'object',
        },
        state: {
          circularReferenceTracker: new Set(),
          dynamicScope: { itemType: '#/components/schemas/User' },
        },
      }),
    ).toBe(true);
  });

  it('returns false when refSchema has no $dynamicAnchor', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: { type: 'object' },
        state: {
          circularReferenceTracker: new Set(),
          dynamicScope: { itemType: '#/components/schemas/User' },
        },
      }),
    ).toBe(false);
  });

  it('returns false when dynamicScope has no matching anchor', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: {
          $dynamicAnchor: 'itemType',
          type: 'object',
        },
        state: {
          circularReferenceTracker: new Set(),
          dynamicScope: {},
        },
      }),
    ).toBe(false);
  });

  it('returns false when dynamicScope is undefined', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: {
          $dynamicAnchor: 'itemType',
          type: 'object',
        },
        state: {
          circularReferenceTracker: new Set(),
        },
      }),
    ).toBe(false);
  });

  it('returns false when scope anchor maps to same ref (self-reference)', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: {
          $dynamicAnchor: 'itemType',
          type: 'object',
        },
        state: {
          circularReferenceTracker: new Set(),
          dynamicScope: { itemType: '#/components/schemas/Template' },
        },
      }),
    ).toBe(false);
  });

  it('returns false when ref is in circular reference tracker', () => {
    expect(
      shouldInlineDynamicRefTarget({
        ref: '#/components/schemas/Template',
        refSchema: {
          $dynamicAnchor: 'itemType',
          type: 'object',
        },
        state: {
          circularReferenceTracker: new Set(['#/components/schemas/Template']),
          dynamicScope: { itemType: '#/components/schemas/User' },
        },
      }),
    ).toBe(false);
  });
});

describe('getDynamicDefsBindings', () => {
  it('returns empty for schema without $defs', () => {
    expect(getDynamicDefsBindings({ type: 'object' })).toEqual([]);
  });

  it('returns empty for empty $defs', () => {
    expect(getDynamicDefsBindings({ $defs: {} })).toEqual([]);
  });

  it('returns entries with both $dynamicAnchor and $ref', () => {
    expect(
      getDynamicDefsBindings({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toEqual([['itemType', '#/components/schemas/User']]);
  });

  it('skips entries missing $dynamicAnchor or $ref', () => {
    expect(
      getDynamicDefsBindings({
        $defs: {
          a: { $dynamicAnchor: 'a' } as any,
          b: { $ref: '#/components/schemas/X' } as any,
          c: { type: 'string' } as any,
          valid: {
            $dynamicAnchor: 'valid',
            $ref: '#/components/schemas/Y',
          },
        },
      }),
    ).toEqual([['valid', '#/components/schemas/Y']]);
  });

  it('returns multiple bindings', () => {
    expect(
      getDynamicDefsBindings({
        $defs: {
          dataType: {
            $dynamicAnchor: 'dataType',
            $ref: '#/components/schemas/Data',
          },
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toEqual([
      ['dataType', '#/components/schemas/Data'],
      ['itemType', '#/components/schemas/User'],
    ]);
  });

  it('ignores non-object $defs entries', () => {
    expect(
      getDynamicDefsBindings({
        $defs: {
          a: null as any,
          b: 'str' as any,
          c: [{}] as any,
        },
      }),
    ).toEqual([]);
  });
});

describe('getTemplateParams', () => {
  it('returns empty for schema without $defs', () => {
    expect(getTemplateParams({ type: 'object' })).toEqual([]);
  });

  it('returns empty for empty $defs', () => {
    expect(getTemplateParams({ $defs: {} })).toEqual([]);
  });

  it('detects template params from $defs with $dynamicAnchor but no $ref', () => {
    expect(
      getTemplateParams({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            not: {},
          },
        },
      }),
    ).toEqual([{ anchor: 'itemType', paramName: 'ItemType' }]);
  });

  it('capitalizes anchor name to derive paramName', () => {
    expect(
      getTemplateParams({
        $defs: {
          folderType: {
            $dynamicAnchor: 'folderType',
            not: {},
          },
        },
      }),
    ).toEqual([{ anchor: 'folderType', paramName: 'FolderType' }]);
  });

  it('skips entries that have $ref (those are bindings, not template params)', () => {
    expect(
      getTemplateParams({
        $defs: {
          itemType: {
            $dynamicAnchor: 'itemType',
            $ref: '#/components/schemas/User',
          },
        },
      }),
    ).toEqual([]);
  });

  it('returns multiple template params', () => {
    expect(
      getTemplateParams({
        $defs: {
          dataType: {
            $dynamicAnchor: 'dataType',
            not: {},
          },
          itemType: {
            $dynamicAnchor: 'itemType',
            not: {},
          },
        },
      }),
    ).toEqual([
      { anchor: 'dataType', paramName: 'DataType' },
      { anchor: 'itemType', paramName: 'ItemType' },
    ]);
  });

  it('ignores non-object $defs entries', () => {
    expect(
      getTemplateParams({
        $defs: {
          a: null as any,
          b: 'str' as any,
          c: [{}] as any,
        },
      }),
    ).toEqual([]);
  });

  it('handles single-character anchor', () => {
    expect(
      getTemplateParams({
        $defs: {
          t: {
            $dynamicAnchor: 't',
            not: {},
          },
        },
      }),
    ).toEqual([{ anchor: 't', paramName: 'T' }]);
  });

  it('sanitizes anchors with separator characters', () => {
    expect(
      getTemplateParams({
        $defs: {
          itemType: {
            $dynamicAnchor: 'item-type',
            not: {},
          },
        },
      }),
    ).toEqual([{ anchor: 'item-type', paramName: 'ItemType' }]);
  });

  it('deduplicates paramName collisions with numeric suffix', () => {
    expect(
      getTemplateParams({
        $defs: {
          itemType: {
            $dynamicAnchor: 'item_type',
            not: {},
          },
          itemType2: {
            $dynamicAnchor: 'item-type',
            not: {},
          },
        },
      }),
    ).toEqual([
      { anchor: 'item_type', paramName: 'ItemType' },
      { anchor: 'item-type', paramName: 'ItemType2' },
    ]);
  });
});

describe('buildGenericRef', () => {
  it('builds IR with typeArgs matching template params order', () => {
    const result = buildGenericRef({
      bindings: [['itemType', '#/components/schemas/User']],
      schema: { $ref: '#/components/schemas/PaginatedTemplate' },
      targetRef: '#/components/schemas/PaginatedTemplate',
      templateParams: [{ anchor: 'itemType', paramName: 'ItemType' }],
    });

    expect(result.$ref).toBe('#/components/schemas/PaginatedTemplate');
    expect(result.typeArgs).toEqual([{ $ref: '#/components/schemas/User' }]);
  });

  it('uses unknown for template params without bindings', () => {
    const result = buildGenericRef({
      bindings: [],
      schema: { $ref: '#/components/schemas/PaginatedTemplate' },
      targetRef: '#/components/schemas/PaginatedTemplate',
      templateParams: [{ anchor: 'itemType', paramName: 'ItemType' }],
    });

    expect(result.typeArgs).toEqual([{ type: 'unknown' }]);
  });

  it('handles multiple type args', () => {
    const result = buildGenericRef({
      bindings: [
        ['itemType', '#/components/schemas/User'],
        ['dataType', '#/components/schemas/Data'],
      ],
      schema: { $ref: '#/components/schemas/PairTemplate' },
      targetRef: '#/components/schemas/PairTemplate',
      templateParams: [
        { anchor: 'itemType', paramName: 'ItemType' },
        { anchor: 'dataType', paramName: 'DataType' },
      ],
    });

    expect(result.typeArgs).toEqual([
      { $ref: '#/components/schemas/User' },
      { $ref: '#/components/schemas/Data' },
    ]);
  });

  it('mixes bound and unbound params', () => {
    const result = buildGenericRef({
      bindings: [['dataType', '#/components/schemas/Data']],
      schema: { $ref: '#/components/schemas/PairTemplate' },
      targetRef: '#/components/schemas/PairTemplate',
      templateParams: [
        { anchor: 'itemType', paramName: 'ItemType' },
        { anchor: 'dataType', paramName: 'DataType' },
      ],
    });

    expect(result.typeArgs).toEqual([{ type: 'unknown' }, { $ref: '#/components/schemas/Data' }]);
  });

  it('omits typeArgs when no template params', () => {
    const result = buildGenericRef({
      bindings: [],
      schema: { $ref: '#/components/schemas/Plain' },
      targetRef: '#/components/schemas/Plain',
      templateParams: [],
    });

    expect(result.typeArgs).toBeUndefined();
  });

  it('preserves schema metadata fields', () => {
    const result = buildGenericRef({
      bindings: [['itemType', '#/components/schemas/User']],
      schema: {
        $ref: '#/components/schemas/Template',
        deprecated: true,
        description: 'A paginated list',
        title: 'Paginated',
      },
      targetRef: '#/components/schemas/Template',
      templateParams: [{ anchor: 'itemType', paramName: 'ItemType' }],
    });

    expect(result.deprecated).toBe(true);
    expect(result.description).toBe('A paginated list');
    expect(result.title).toBe('Paginated');
  });

  it('preserves nullability from generic ref schemas', () => {
    const result = buildGenericRef({
      bindings: [['itemType', '#/components/schemas/User']],
      schema: {
        $ref: '#/components/schemas/Template',
        type: ['object', 'null'],
      },
      targetRef: '#/components/schemas/Template',
      templateParams: [{ anchor: 'itemType', paramName: 'ItemType' }],
    });

    expect(result).toEqual({
      items: [
        {
          $ref: '#/components/schemas/Template',
          typeArgs: [{ $ref: '#/components/schemas/User' }],
        },
        { type: 'null' },
      ],
      logicalOperator: 'or',
    });
  });
});

describe('containsRefTo', () => {
  const targetRef = '#/components/schemas/Foo';

  it('detects direct $ref match', () => {
    expect(containsRefTo({ $ref: targetRef }, targetRef)).toBe(true);
  });

  it('returns false for non-matching $ref', () => {
    expect(containsRefTo({ $ref: '#/components/schemas/Bar' }, targetRef)).toBe(false);
  });

  it('detects $ref inside allOf', () => {
    expect(
      containsRefTo(
        {
          allOf: [{ $ref: targetRef }, { type: 'object' }],
        },
        targetRef,
      ),
    ).toBe(true);
  });

  it('detects $ref inside anyOf', () => {
    expect(
      containsRefTo(
        {
          anyOf: [{ type: 'null' }, { $ref: targetRef }],
        },
        targetRef,
      ),
    ).toBe(true);
  });

  it('detects $ref inside oneOf', () => {
    expect(
      containsRefTo(
        {
          oneOf: [{ $ref: targetRef }, { type: 'string' }],
        },
        targetRef,
      ),
    ).toBe(true);
  });

  it('detects nested cycles through allOf containing oneOf', () => {
    expect(
      containsRefTo(
        {
          allOf: [
            {
              oneOf: [{ $ref: targetRef }, { type: 'string' }],
            },
            { type: 'object' },
          ],
        },
        targetRef,
      ),
    ).toBe(true);
  });

  it('detects two-hop allOf chain', () => {
    expect(
      containsRefTo(
        {
          allOf: [
            {
              allOf: [{ $ref: targetRef }],
            },
          ],
        },
        targetRef,
      ),
    ).toBe(true);
  });

  it('returns false for null schema', () => {
    expect(containsRefTo(null, targetRef)).toBe(false);
  });

  it('returns false for undefined schema', () => {
    expect(containsRefTo(undefined, targetRef)).toBe(false);
  });

  it('returns false for schema without composites', () => {
    expect(containsRefTo({ type: 'string' }, targetRef)).toBe(false);
  });
});
