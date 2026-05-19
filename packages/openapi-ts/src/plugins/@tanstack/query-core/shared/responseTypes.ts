import ts from 'typescript';

import { $ } from '../../../../ts-dsl';
import type { MaybeTsDsl } from '../../../../ts-dsl/base';
import { TsDsl } from '../../../../ts-dsl/base';
import type { PluginInstance } from '../types';

const RESPONSE_RESULT = 'ResponseResult';
const RESPONSE_ERROR = 'ResponseError';
const STYLE_PARAM = 'TStyle';

/**
 * Escape hatch DSL for raw `ts.TypeNode` values. Used for conditional types
 * which the DSL doesn't natively support.
 */
class RawTypeTsDsl extends TsDsl<ts.TypeNode> {
  readonly '~dsl' = 'RawTypeTsDsl';

  constructor(private readonly _node: ts.TypeNode) {
    super();
  }

  override toAst() {
    return this._node;
  }
}

/**
 * Builds a conditional type node:
 * `TStyle extends 'fields' ? trueType : falseType`.
 */
const conditionalOnFields = (
  trueType: MaybeTsDsl<ts.TypeNode>,
  falseType: MaybeTsDsl<ts.TypeNode>,
): RawTypeTsDsl => {
  const toType = (value: MaybeTsDsl<ts.TypeNode>): ts.TypeNode =>
    value instanceof TsDsl ? (value.toAst() as ts.TypeNode) : (value as ts.TypeNode);
  return new RawTypeTsDsl(
    ts.factory.createConditionalTypeNode(
      ts.factory.createTypeReferenceNode(STYLE_PARAM),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('fields')),
      toType(trueType),
      toType(falseType),
    ),
  );
};

const styleUnion = () => $.type.or($.type.literal('data'), $.type.literal('fields'));

const ensureSymbol = (
  plugin: PluginInstance,
  name: typeof RESPONSE_RESULT | typeof RESPONSE_ERROR,
) => {
  const existing = plugin.querySymbol({
    category: 'type',
    resource: name,
    tool: plugin.name,
  });
  if (existing) return existing;

  const symbol = plugin.symbol(name, {
    meta: {
      category: 'type',
      resource: name,
      tool: plugin.name,
    },
  });

  if (name === RESPONSE_RESULT) {
    // type ResponseResult<T, TStyle extends 'data' | 'fields'> =
    //   TStyle extends 'fields'
    //     ? { data: T; request: Request; response: Response }
    //     : T;
    plugin.node(
      $.type
        .alias(symbol)
        .generic('T')
        .generic(STYLE_PARAM, (g) => g.extends(styleUnion()))
        .type(
          conditionalOnFields(
            $.type
              .object()
              .prop('data', (p) => p.type('T'))
              .prop('request', (p) => p.type('Request'))
              .prop('response', (p) => p.type('Response')),
            $.type('T'),
          ),
        ),
    );
  } else {
    // type ResponseError<E, TStyle extends 'data' | 'fields'> =
    //   TStyle extends 'fields'
    //     ? { error: E; request?: Request; response?: Response }
    //     : E;
    plugin.node(
      $.type
        .alias(symbol)
        .generic('E')
        .generic(STYLE_PARAM, (g) => g.extends(styleUnion()))
        .type(
          conditionalOnFields(
            $.type
              .object()
              .prop('error', (p) => p.type('E'))
              .prop('request', (p) => p.type('Request').optional())
              .prop('response', (p) => p.type('Response').optional()),
            $.type('E'),
          ),
        ),
    );
  }

  return symbol;
};

/**
 * Ensures that the shared `ResponseResult<T, TStyle>` and
 * `ResponseError<E, TStyle>` type aliases are emitted exactly once in the
 * generated tanstack file. Returns the symbols so callers can build typed
 * references.
 */
export const ensureFieldsResponseTypes = (plugin: PluginInstance) => ({
  symbolResponseError: ensureSymbol(plugin, RESPONSE_ERROR),
  symbolResponseResult: ensureSymbol(plugin, RESPONSE_RESULT),
});

/**
 * Wraps a DSL expression in parentheses (`(expr)`). Useful when an `as`
 * cast would otherwise bind tighter than the inner expression — e.g. a
 * ternary cast like `(a ? b : c) as T`.
 */
class ParenExprTsDsl extends TsDsl<ts.Expression> {
  readonly '~dsl' = 'ParenExprTsDsl';

  constructor(private readonly _inner: TsDsl<ts.Expression>) {
    super();
  }

  override toAst(): ts.Expression {
    return ts.factory.createParenthesizedExpression(this._inner.toAst());
  }
}

export const parenExpr = (inner: TsDsl<ts.Expression>): ParenExprTsDsl => new ParenExprTsDsl(inner);

/**
 * Name of the per-call style generic parameter exposed on helper functions
 * (queryOptions / mutationOptions / infiniteQueryOptions) when the plugin is
 * configured with `responseStyle: 'fields'`.
 */
export const fieldsStyleParamName = STYLE_PARAM;

/**
 * Builds the union literal `'data' | 'fields'` used as the constraint for the
 * `TStyle` generic on helper functions.
 */
export const fieldsStyleUnion = styleUnion;
