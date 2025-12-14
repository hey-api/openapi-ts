import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { $ } from '~/ts-dsl';

import type { HeyApiSdkPlugin } from '../types';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import {
  operationMethodName,
  operationParameters,
  operationStatements,
} from './operation';

export const generateFlatSdk = ({
  plugin,
}: {
  plugin: HeyApiSdkPlugin['Instance'];
}): void => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  plugin.forEach(
    'operation',
    (event) => {
      const { operation } = event;
      const isRequiredOptions = isOperationOptionsRequired({
        context: plugin.context,
        operation,
      });
      const symbolResponse = isNuxtClient
        ? plugin.querySymbol({
            category: 'type',
            resource: 'operation',
            resourceId: operation.id,
            role: 'response',
          })
        : undefined;
      const opParameters = operationParameters({
        isRequiredOptions,
        operation,
        plugin,
      });
      const statements = operationStatements({
        isRequiredOptions,
        opParameters,
        operation,
        plugin,
      });
      const symbol = plugin.symbol(operationMethodName({ operation, plugin }), {
        meta: {
          category: 'sdk',
          path: event._path,
          resource: 'operation',
          resourceId: operation.id,
          tags: event.tags,
          tool: 'sdk',
        },
      });
      const node = $.const(symbol)
        .export()
        .$if(createOperationComment(operation), (c, v) => c.doc(v))
        .assign(
          $.func()
            .params(...opParameters.parameters)
            .$if(
              isNuxtClient,
              (f) =>
                f
                  .generic(nuxtTypeComposable, (g) =>
                    g
                      .extends(
                        plugin.referenceSymbol({
                          category: 'external',
                          resource: 'client.Composable',
                        }),
                      )
                      .default($.type.literal('$fetch')),
                  )
                  .generic(nuxtTypeDefault, (g) =>
                    g.$if(
                      symbolResponse,
                      (t, s) => t.extends(s).default(s),
                      (t) => t.default('undefined'),
                    ),
                  ),
              (f) =>
                f.generic('ThrowOnError', (g) =>
                  g
                    .extends('boolean')
                    .default(
                      ('throwOnError' in client.config
                        ? client.config.throwOnError
                        : false) ?? false,
                    ),
                ),
            )
            .do(...statements),
        );
      plugin.node(node);
    },
    {
      order: 'declarations',
    },
  );
};
