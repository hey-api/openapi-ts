import { tsc } from '../../tsc';

export const identifiers = {
  /**
   * {@link https://arktype.io/docs/type-api Type API}
   */
  type: {
    $: tsc.identifier({ text: '$' }),
    allows: tsc.identifier({ text: 'allows' }),
    and: tsc.identifier({ text: 'and' }),
    array: tsc.identifier({ text: 'array' }),
    as: tsc.identifier({ text: 'as' }),
    assert: tsc.identifier({ text: 'assert' }),
    brand: tsc.identifier({ text: 'brand' }),
    configure: tsc.identifier({ text: 'configure' }),
    default: tsc.identifier({ text: 'default' }),
    describe: tsc.identifier({ text: 'describe' }),
    description: tsc.identifier({ text: 'description' }),
    equals: tsc.identifier({ text: 'equals' }),
    exclude: tsc.identifier({ text: 'exclude' }),
    expression: tsc.identifier({ text: 'expression' }),
    extends: tsc.identifier({ text: 'extends' }),
    extract: tsc.identifier({ text: 'extract' }),
    filter: tsc.identifier({ text: 'filter' }),
    from: tsc.identifier({ text: 'from' }),
    ifEquals: tsc.identifier({ text: 'ifEquals' }),
    ifExtends: tsc.identifier({ text: 'ifExtends' }),
    infer: tsc.identifier({ text: 'infer' }),
    inferIn: tsc.identifier({ text: 'inferIn' }),
    intersect: tsc.identifier({ text: 'intersect' }),
    json: tsc.identifier({ text: 'json' }),
    meta: tsc.identifier({ text: 'meta' }),
    narrow: tsc.identifier({ text: 'narrow' }),
    onDeepUndeclaredKey: tsc.identifier({ text: 'onDeepUndeclaredKey' }),
    onUndeclaredKey: tsc.identifier({ text: 'onUndeclaredKey' }),
    optional: tsc.identifier({ text: 'optional' }),
    or: tsc.identifier({ text: 'or' }),
    overlaps: tsc.identifier({ text: 'overlaps' }),
    pipe: tsc.identifier({ text: 'pipe' }),
    select: tsc.identifier({ text: 'select' }),
    to: tsc.identifier({ text: 'to' }),
    toJsonSchema: tsc.identifier({ text: 'toJsonSchema' }),
  },
};
