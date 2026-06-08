import type { AnalysisContext } from '@hey-api/codegen-core';
import ts from 'typescript';

import { getTypedConfig } from '../../../../config/utils';
import { getClientPlugin } from '../../../../plugins/@hey-api/client-core/utils';
import { $, TsDsl } from '../../../../ts-dsl';
import type { HeyApiSdkPlugin } from '../types';
import { isInstance } from '../v1/node';
import { nuxtTypeDefault, nuxtTypeResponse } from './constants';

function createMetaType(
  clientMetaSymbol: ReturnType<HeyApiSdkPlugin['Instance']['symbol']>,
): TsDsl<ts.ConditionalTypeNode> {
  return new (class extends TsDsl<ts.ConditionalTypeNode> {
    readonly '~dsl' = 'MetaType' as const;
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
      ctx.analyze(clientMetaSymbol);
    }
    override toAst(): ts.ConditionalTypeNode {
      return ts.factory.createConditionalTypeNode(
        ts.factory.createTypeOperatorNode(
          ts.SyntaxKind.KeyOfKeyword,
          ts.factory.createTypeReferenceNode(clientMetaSymbol.finalName),
        ),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
        ts.factory.createTypeReferenceNode('Record', [
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ]),
        ts.factory.createTypeReferenceNode(clientMetaSymbol.finalName),
      );
    }
  })();
}

export function createTypeOptions({ plugin }: { plugin: HeyApiSdkPlugin['Instance'] }) {
  const client = getClientPlugin(getTypedConfig(plugin));
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const symbolOptions = plugin.symbol('Options', {
    meta: {
      category: 'type',
      resource: 'client-options',
      tool: 'sdk',
    },
  });

  const typeOptions = $.type
    .alias(symbolOptions)
    .export()
    .$if(
      isNuxtClient,
      (t) =>
        t
          .generic('TComposable', (g) =>
            g.extends(plugin.symbols.Composable).default($.type.literal('$fetch')),
          )
          .generic('TData', (g) =>
            g.extends(plugin.symbols.TDataShape).default(plugin.symbols.TDataShape),
          )
          .generic(nuxtTypeResponse, (g) => g.default('unknown'))
          .generic(nuxtTypeDefault, (g) => g.default('undefined')),
      (t) =>
        t
          .generic('TData', (g) =>
            g.extends(plugin.symbols.TDataShape).default(plugin.symbols.TDataShape),
          )
          .generic('ThrowOnError', (g) => g.extends('boolean').default('boolean'))
          .generic('TResponse', (g) => g.default('unknown')),
    )
    .type(
      $.type.and(
        $.type(plugin.symbols.Options).$if(
          isNuxtClient,
          (t) =>
            t
              .generic('TComposable')
              .generic('TData')
              .generic(nuxtTypeResponse)
              .generic(nuxtTypeDefault),
          (t) => t.generic('TData').generic('ThrowOnError').generic('TResponse'),
        ),
        $.type
          .object()
          .prop('client', (p) =>
            p
              .doc([
                'You can provide a client instance returned by `createClient()` instead of',
                'individual options. This might be also useful if you want to implement a',
                'custom client.',
              ])
              .required(!plugin.config.client && !isInstance(plugin))
              .type(plugin.symbols.Client),
          )
          .prop('meta', (p) =>
            p
              .doc([
                'You can pass arbitrary values through the `meta` object. This can be',
                "used to access values that aren't defined as part of the SDK function.",
                '',
                'Augment the `ClientMeta` interface (via `declare module`) to make this',
                'option typesafe.',
              ])
              .optional()
              .type(createMetaType(plugin.symbols.ClientMeta)),
          ),
      ),
    );
  plugin.node(typeOptions);
}
