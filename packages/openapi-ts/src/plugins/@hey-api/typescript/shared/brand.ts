import type { Ref, SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import { applyNaming, pathToName } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin } from '../types';
import type { Type } from './types';

const brandContainerMeta = {
  artifact: 'types',
  category: 'type',
  resource: 'brand',
  variant: 'container',
} as const satisfies SymbolMeta;

const brandSymbolMeta = {
  category: 'type',
  resource: 'brand',
  variant: 'symbol',
} as const satisfies SymbolMeta;

function ensureBrandContainer(plugin: HeyApiTypeScriptPlugin['Instance']): void {
  // TODO: contract (self)
  if (plugin.querySymbol(brandContainerMeta)) return;

  const brandSymbol = plugin.symbol('brand', {
    meta: brandSymbolMeta,
  });
  const brandSymbolNode = $.const(brandSymbol).export().declare().type($.type('symbol').unique());
  plugin.node(brandSymbolNode);

  const containerSymbol = plugin.symbol('Brand', {
    meta: brandContainerMeta,
  });
  const containerNode = $.type
    .alias(containerSymbol)
    .export()
    .generic('T')
    .generic('B', (g) => g.extends('string'))
    .type(
      $.type.and(
        $.type('T'),
        $.type.object().computed(brandSymbol, (p) => p.type('B').readonly()),
      ),
    );
  plugin.node(containerNode);
}

export function brandType(ctx: {
  base: Type;
  /** Whether the type is brandable. */
  brandable?: boolean;
  path: Ref<ReadonlyArray<string | number>>;
  plugin: HeyApiTypeScriptPlugin['Instance'];
}): Type | undefined {
  if (ctx.brandable === false) return;

  const nameFromPath = applyNaming(pathToName(fromRef(ctx.path)), {
    casing: 'PascalCase',
  });
  if (!nameFromPath) return;

  const { plugin } = ctx;
  const { brand } = plugin.config;

  const result = brand(nameFromPath);
  if (!result) return;

  ensureBrandContainer(plugin);

  // TODO: contract (self)
  const brandRef = plugin.referenceSymbol(brandContainerMeta);
  const brandName = result === true ? nameFromPath : result;
  return $.type(brandRef).generics(ctx.base, $.type.literal(brandName));
}
