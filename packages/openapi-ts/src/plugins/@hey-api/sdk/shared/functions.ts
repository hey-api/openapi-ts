import { clientFolderAbsolutePath } from '~/generate/client';
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

  // Register RequestResult type for explicit return type annotations
  const clientModule = clientFolderAbsolutePath(plugin.context.config);
  const symbolRequestResult = !isNuxtClient
    ? plugin.registerSymbol({
        external: clientModule,
        kind: 'type',
        name: 'RequestResult',
      })
    : undefined;

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
      const symbol = plugin.registerSymbol({
        meta: {
          category: 'sdk',
          path: event._path,
          resource: 'operation',
          resourceId: operation.id,
          tags: event.tags,
          tool: 'sdk',
        },
        name: serviceFunctionIdentifier({
          config: plugin.context.config,
          handleIllegal: true,
          id: operation.id,
          operation,
        }),
      });

      // Construct explicit return type to prevent circular type inference issues
      // Only for non-Nuxt clients (Nuxt has a different return type structure)
      let returnType: any;

      if (!isNuxtClient && symbolRequestResult) {
        // Query symbols for response and error types
        const symbolResponseType = plugin.querySymbol({
          category: 'type',
          resource: 'operation',
          resourceId: operation.id,
          role: 'responses',
        });
        const responseType = symbolResponseType?.placeholder || 'unknown';

        const symbolErrorType = plugin.querySymbol({
          category: 'type',
          resource: 'operation',
          resourceId: operation.id,
          role: 'errors',
        });
        const errorType = symbolErrorType?.placeholder || 'unknown';

        // Build return type: RequestResult<TResponses, TErrors, ThrowOnError, TResponseStyle?>
        const typeArguments = [
          tsc.typeNode(responseType),
          tsc.typeNode(errorType),
          tsc.typeNode('ThrowOnError'),
        ];

        // Add responseStyle type argument if using 'data' response style
        if (plugin.config.responseStyle === 'data') {
          typeArguments.push(tsc.typeNode(tsc.ots.string('data')));
        }

        returnType = tsc.typeReferenceNode({
          typeArguments,
          typeName: symbolRequestResult.placeholder,
        });
      }

      const node = tsc.constVariable({
        comment: createOperationComment({ operation }),
        exportConst: true,
        expression: tsc.arrowFunction({
          parameters: opParameters.parameters,
          returnType,
          statements,
          types: isNuxtClient
            ? [
                {
                  default: tsc.ots.string('$fetch'),
                  extends: tsc.typeNode(
                    plugin.referenceSymbol({
                      category: 'external',
                      resource: 'client.Composable',
                    }).placeholder,
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
