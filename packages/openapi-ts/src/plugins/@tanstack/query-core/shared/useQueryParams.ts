import { $ } from '../../../../ts-dsl';
import type { PluginInstance } from '../types';

export const createUseQueryParamsType = ({ plugin }: { plugin: PluginInstance }) => {
  const TFactory = 'TFactory';

  const symbolUseQueryParams = plugin.symbol('UseQueryParams', {
    meta: {
      category: 'utility',
      resource: 'UseQueryParams',
      tool: plugin.name,
    },
  });

  const aliasNode = $.type
    .alias(symbolUseQueryParams)
    .generic(TFactory, (g) => g.extends($.type('(...args: any) => any')))
    .type(
      $.type.and(
        $.type(`NonNullable<Parameters<${TFactory}>[0]>`),
        $.type
          .object()
          .prop('queryOptions', (p) =>
            p
              .optional()
              .type(
                $.type('Partial').generic(
                  $.type('Omit').generics(
                    $.type(`ReturnType<${TFactory}>`),
                    $.type.or($.type.literal('queryKey'), $.type.literal('queryFn')),
                  ),
                ),
              ),
          ),
      ),
    );
  plugin.node(aliasNode);
};
