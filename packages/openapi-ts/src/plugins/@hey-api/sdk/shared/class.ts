import type { Symbol } from '@hey-api/codegen-core';

import { $ } from '~/ts-dsl';

import { SdkStructureModel } from '../model/structure';
import type { HeyApiSdkPlugin } from '../types';

export const registryName = '__registry';

export const createRegistryClass = ({
  plugin,
  sdkSymbol,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  sdkSymbol: Symbol;
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symbolDefaultKey = plugin.symbol('defaultKey');
  const symbolInstances = plugin.symbol('instances');
  return $.class(symbol)
    .generic('T')
    .field(symbolDefaultKey, (f) =>
      f.private().readonly().assign($.literal('default')),
    )
    .newline()
    .field(symbolInstances, (f) =>
      f
        .private()
        .readonly()
        .type($.type('Map').generics('string', 'T'))
        .assign($.new('Map')),
    )
    .newline()
    .method('get', (m) =>
      m
        .returns('T')
        .param('key', (p) => p.type('string').optional())
        .do(
          $.const('instance').assign(
            $('this')
              .attr(symbolInstances)
              .attr('get')
              .call($('key').coalesce($('this').attr(symbolDefaultKey))),
          ),
          $.if($.not('instance')).do(
            $.throw('Error').message(
              $.template('No SDK client found. Create one with "new ')
                .add(sdkSymbol)
                .add('()" to fix this error.'),
            ),
          ),
          $.return('instance'),
        ),
    )
    .newline()
    .method('set', (m) =>
      m
        .returns('void')
        .param('value', (p) => p.type('T'))
        .param('key', (p) => p.type('string').optional())
        .do(
          $('this')
            .attr(symbolInstances)
            .attr('set')
            .call($('key').coalesce($('this').attr(symbolDefaultKey)), 'value'),
        ),
    );
};

export const createClientClass = ({
  plugin,
  symbol,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
  symbol: Symbol;
}): ReturnType<typeof $.class> => {
  const symClient = plugin.getSymbol({ category: 'client' });
  const optionalClient = Boolean(plugin.config.client && symClient);
  const symbolClient = plugin.referenceSymbol({
    category: 'external',
    resource: 'client.Client',
  });
  return $.class(symbol)
    .field('client', (f) => f.protected().type(symbolClient))
    .newline()
    .init((i) =>
      i
        .param('args', (p) =>
          p
            .optional(optionalClient)
            .type(
              $.type
                .object()
                .prop('client', (p) =>
                  p.optional(optionalClient).type(symbolClient),
                ),
            ),
        )
        .do(
          $('this')
            .attr('client')
            .assign(
              $('args')
                .attr('client')
                .optional(optionalClient)
                .$if(optionalClient, (a) => a.coalesce(symClient!)),
            ),
        ),
    );
};

export const generateClassSdk = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}): void => {
  const structure = new SdkStructureModel(plugin.config.instance);

  plugin.forEach(
    'operation',
    ({ operation }) => {
      structure.insert(operation, plugin);
    },
    { order: 'declarations' },
  );

  const allDependencies: Array<ReturnType<typeof $.class>> = [];
  const allNodes: Array<ReturnType<typeof $.class>> = [];

  for (const model of structure.walk()) {
    const { dependencies, node } = model.toNode(plugin);
    allDependencies.push(...dependencies);
    allNodes.push(node);
  }

  const uniqueDependencies = new Map<number, ReturnType<typeof $.class>>();
  for (const dep of allDependencies) {
    if (dep.symbol) uniqueDependencies.set(dep.symbol.id, dep);
  }
  for (const dep of uniqueDependencies.values()) {
    plugin.node(dep);
  }

  for (const node of allNodes) {
    plugin.node(node);
  }
};
