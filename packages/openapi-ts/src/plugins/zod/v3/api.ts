import type { Symbol } from '@hey-api/codegen-core';
import type { RequestSchemaContext, ResolvedRequestValidatorLayer } from '@hey-api/shared';
import { requestValidatorLayers, resolveValidatorLayer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type {
  RequestValidatorResolverContext,
  ResponseValidatorResolverContext,
} from '../resolvers';
import type { Chain } from '../shared/chain';
import { exportAst } from '../shared/export';
import type { ValidatorArgs } from '../shared/types';
import { getDefaultRequestValidatorLayers } from '../shared/validator';
import type { ZodPlugin } from '../types';

function emptyNode(
  ctx: RequestValidatorResolverContext & {
    layer: ResolvedRequestValidatorLayer;
  },
): Chain {
  const { z } = ctx.symbols;
  if (ctx.layer.whenEmpty === 'omit') {
    throw new Error(
      `Cannot create empty schema for layer "${ctx.layer.as}" with whenEmpty: 'omit'`,
    );
  }
  if (ctx.layer.whenEmpty === 'strict') {
    return $(z).attr(identifiers.never).call();
  }
  return $(z).attr(identifiers.object).call($.object());
}

function optionalNode(
  ctx: RequestValidatorResolverContext & {
    layer: ResolvedRequestValidatorLayer;
    schema: Chain;
  },
): Chain {
  if (!ctx.layer.optional) return ctx.schema;
  return $(ctx.schema).attr(identifiers.optional).call();
}

function compositeNode(ctx: RequestValidatorResolverContext): Chain | undefined {
  const { z } = ctx.symbols;
  const obj = $.object();

  const defaultValues = getDefaultRequestValidatorLayers(ctx.operation);
  for (const key of requestValidatorLayers) {
    const layer = resolveValidatorLayer(ctx.layers, key, defaultValues);

    const layerSchema = ctx.plugin.querySymbol({
      category: 'schema',
      resource: 'operation',
      resourceId: ctx.operation.id,
      role: `request-${key}`,
      tool: 'zod',
    });

    if (layerSchema) {
      obj.prop(layer.as, ctx.nodes.optional({ ...ctx, layer, schema: $(layerSchema) }));
      continue;
    }

    if (layer.whenEmpty === 'omit') {
      continue;
    }

    const empty = ctx.nodes.empty({ ...ctx, layer });
    obj.prop(layer.as, ctx.nodes.optional({ ...ctx, layer, schema: empty }));
  }

  if (obj.isEmpty) {
    return;
  }

  return $(z).attr(identifiers.object).call(obj);
}

function requestValidatorResolver(
  ctx: RequestValidatorResolverContext,
): ReturnType<typeof $.return> {
  const { schema } = ctx.symbols;
  return $(schema).attr(identifiers.parseAsync).call('data').await().return();
}

function responseValidatorResolver(
  ctx: ResponseValidatorResolverContext,
): ReturnType<typeof $.return> {
  const { schema } = ctx.symbols;
  return $(schema).attr(identifiers.parseAsync).call('data').await().return();
}

function runRequestResolver(
  ctx: RequestValidatorResolverContext,
): ReturnType<typeof $.func> | undefined {
  const validator = ctx.plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.request;
  const candidates = [resolver, requestValidatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
}

function runResponseResolver(
  ctx: ResponseValidatorResolverContext,
): ReturnType<typeof $.func> | undefined {
  const validator = ctx.plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.response;
  const candidates = [resolver, responseValidatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
}

function createRequestSchemaContext(
  ctx: RequestSchemaContext<ZodPlugin['Instance']>,
): RequestValidatorResolverContext {
  const { plugin } = ctx;
  const z = plugin.external('zod.z');

  return {
    ...ctx,
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      composite: compositeNode,
      empty: emptyNode,
      optional: optionalNode,
    },
    symbols: {
      schema: $(''),
      z,
    },
  };
}

export function createRequestSchemaV3(
  ctx: RequestSchemaContext<ZodPlugin['Instance']>,
): Symbol | Chain | undefined {
  const { operation, plugin } = ctx;
  const baseCtx = createRequestSchemaContext(ctx);

  const schema = baseCtx.nodes.composite(baseCtx);
  if (!schema) return;

  if (!plugin.config.requests.shouldExtract({ operation })) {
    return schema;
  }

  return exportAst({
    final: {
      expression: schema,
    },
    meta: {
      resource: 'operation',
      resourceId: operation.id,
      role: 'data',
    },
    naming: plugin.config.requests,
    namingAnchor: operation.id,
    path: [],
    plugin,
    schema: {},
  });
}

export function createRequestValidatorV3(
  ctx: RequestSchemaContext<ZodPlugin['Instance']>,
): ReturnType<typeof $.func> | undefined {
  const symbolOrSchema = createRequestSchemaV3(ctx);
  if (!symbolOrSchema) return;

  const baseCtx = createRequestSchemaContext(ctx);
  const resolverCtx: RequestValidatorResolverContext = {
    ...baseCtx,
    symbols: {
      ...baseCtx.symbols,
      schema: symbolOrSchema,
    },
  };
  return runRequestResolver(resolverCtx);
}

export function createResponseValidatorV3({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined {
  const symbol = plugin.querySymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'zod',
  });
  if (!symbol) return;

  const z = plugin.external('zod.z');
  const resolverCtx: ResponseValidatorResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    operation,
    plugin,
    symbols: {
      schema: symbol,
      z,
    },
  };
  return runResponseResolver(resolverCtx);
}
