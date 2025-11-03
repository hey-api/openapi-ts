import type { IR } from '~/ir/types';
import { getClientPlugin } from '~/plugins/@hey-api/client-core/utils';
import {
  createOperationComment,
  isOperationOptionsRequired,
} from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';
import { reservedJavaScriptKeywordsRegExp } from '~/utils/regexp';

import type { HeyApiSdkPlugin } from '../types';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import { operationParameters, operationStatements } from './operation';

const serviceFunctionIdentifier = ({
  id,
  operation,
  plugin,
}: {
  id: string;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}) => {
  if (plugin.config.methodNameBuilder) {
    return plugin.config.methodNameBuilder(operation);
  }

  if (id.match(reservedJavaScriptKeywordsRegExp)) {
    return `${id}_`;
  }

  return id;
};

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
          id: operation.id,
          operation,
          plugin,
        }),
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
