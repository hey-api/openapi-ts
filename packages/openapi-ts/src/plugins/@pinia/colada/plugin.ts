import type { ICodegenSymbolOut } from '@hey-api/codegen-core';

import { TypeScriptRenderer } from '../../../generate/renderer';
import { stringCase } from '../../../utils/stringCase';
import { getClientPlugin } from '../../@hey-api/client-core/utils';
import { operationClasses } from '../../@hey-api/sdk/operation';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { createMutationOptions } from './mutationOptions';
import { createQueryOptions } from './queryOptions';
import type { PluginState } from './state';
import type { PiniaColadaPlugin } from './types';

export const handler: PiniaColadaPlugin['Handler'] = ({ plugin }) => {
  const f = plugin.gen.createFile(plugin.output, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  const state: PluginState = {
    hasCreateQueryKeyParamsFunction: false,
    hasMutations: false,
    hasQueries: false,
    hasUsedQueryFn: false,
  };

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');
  const symbolOptions = plugin.gen.selectSymbolFirst(
    sdkPlugin.api.getSelector('Options'),
  );
  if (symbolOptions) {
    f.addImport({
      from: symbolOptions.file,
      typeNames: [symbolOptions.placeholder],
    });
  }

  plugin.forEach('operation', ({ operation }) => {
    state.hasUsedQueryFn = false;

    const classes = sdkPlugin.config.asClass
      ? operationClasses({
          context: plugin.context,
          operation,
          plugin: sdkPlugin,
        })
      : undefined;
    const entry = classes ? classes.values().next().value : undefined;
    const queryFn =
      // TODO: this should use class graph to determine correct path string
      // as it's really easy to break once we change the class casing
      (
        entry
          ? [
              entry.path[0],
              ...entry.path.slice(1).map((className: string) =>
                stringCase({
                  case: 'camelCase',
                  value: className,
                }),
              ),
              entry.methodName,
            ].filter(Boolean)
          : [
              serviceFunctionIdentifier({
                config: plugin.context.config,
                handleIllegal: true,
                id: operation.id,
                operation,
              }),
            ]
      ).join('.');

    if (plugin.hooks.operation.isQuery(operation)) {
      if (plugin.config.queryOptions.enabled) {
        createQueryOptions({
          operation,
          plugin,
          queryFn,
          state,
        });
      }
    }

    if (plugin.hooks.operation.isMutation(operation)) {
      if (plugin.config.mutationOptions.enabled) {
        createMutationOptions({
          operation,
          plugin,
          queryFn,
          state,
        });
      }
    }

    if (state.hasUsedQueryFn) {
      const symbolImport = plugin.gen.selectSymbolFirst(
        entry
          ? sdkPlugin.api.getSelector('class', entry.path[0])
          : sdkPlugin.api.getSelector('function', operation.id),
      );
      if (symbolImport) {
        f.addImport({
          from: symbolImport.file,
          names: [symbolImport.placeholder],
        });
      }
    }
  });

  if (state.hasQueries) {
    let symbolClient: ICodegenSymbolOut | undefined;
    const client = getClientPlugin(plugin.context.config);
    if (client.api && 'getSelector' in client.api) {
      symbolClient = plugin.gen.selectSymbolFirst(
        // @ts-expect-error
        client.api.getSelector('client'),
      );
      if (symbolClient) {
        f.addImport({
          from: symbolClient.file,
          names: [symbolClient.placeholder],
        });
      }
    }
  }

  if (plugin.config.exportFromIndex && f.hasContent()) {
    const index = plugin.gen.ensureFile('index');
    index.addExport({ from: f, namespaceImport: true });
  }
};
