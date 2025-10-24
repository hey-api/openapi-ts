import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';

import { serviceFunctionIdentifier } from '../plugin-legacy';
import type { HeyApiSdkPlugin } from '../types';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import { operationParameters, operationStatements } from './operation';

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
      const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
      const symbolResponse = isNuxtClient
        ? plugin.getSymbol(
            pluginTypeScript.api.selector('response', operation.id),
          )
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
      const symbol = plugin.registerSymbol({
        meta: {
          path: event._path,
          tags: event.tags,
        },
        name: serviceFunctionIdentifier({
          config: plugin.context.config,
          handleIllegal: true,
          id: operation.id,
          operation,
        }),
        selector: plugin.api.selector('function', operation.id),
      });
      const node = tsc.constVariable({
        comment: createOperationComment({ operation }),
        exportConst: true,
        expression: tsc.arrowFunction({
          parameters: opParameters.parameters,
          returnType: undefined,
          statements,
          types: isNuxtClient
            ? [
                {
                  default: tsc.ots.string('$fetch'),
                  extends: tsc.typeNode(
                    plugin.referenceSymbol(plugin.api.selector('Composable'))
                      .placeholder,
                  ),
                  name: nuxtTypeComposable,
                },
                {
                  default: symbolResponse
                    ? tsc.typeReferenceNode({
                        typeName: symbolResponse.placeholder,
                      })
                    : tsc.typeNode('undefined'),
                  extends: symbolResponse
                    ? tsc.typeReferenceNode({
                        typeName: symbolResponse.placeholder,
                      })
                    : undefined,
                  name: nuxtTypeDefault,
                },
              ]
            : [
                {
                  default:
                    ('throwOnError' in client.config
                      ? client.config.throwOnError
                      : false) ?? false,
                  extends: 'boolean',
                  name: 'ThrowOnError',
                },
              ],
        }),
        name: symbol.placeholder,
      });
      plugin.setSymbolValue(symbol, node);
    },
    {
      order: 'declarations',
    },
  );
};
