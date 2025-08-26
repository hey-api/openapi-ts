import { HeyApiError } from '../../../error';
import type { IR } from '../../../ir/types';
import type { OpenApi } from '../../../openApi/types';
import type { PluginConfigMap } from '../../config';
import type { Plugin } from '../../types';
import type { WalkEvent, WalkEventType } from '../types/instance';

const defaultGetKind: Required<Required<IR.Hooks>['operations']>['getKind'] = (
  operation,
) => {
  switch (operation.method) {
    case 'delete':
    case 'patch':
    case 'post':
    case 'put':
      return ['mutation'];
    case 'get':
      return ['query'];
    default:
      return [];
  }
};

export class PluginInstance<T extends Plugin.Types = Plugin.Types> {
  api: T['api'];
  config: Omit<T['resolvedConfig'], 'name' | 'output'>;
  context: IR.Context;
  dependencies: Required<Plugin.Config<T>>['dependencies'] = [];
  private handler: Plugin.Config<T>['handler'];
  name: T['resolvedConfig']['name'];
  output: Required<T['config']>['output'];
  /**
   * The package metadata and utilities for the current context, constructed
   * from the provided dependencies. Used for managing package-related
   * information such as name, version, and dependency resolution during
   * code generation.
   */
  package: IR.Context['package'];

  constructor(
    props: Pick<
      Required<Plugin.Config<T>>,
      'config' | 'dependencies' | 'handler'
    > & {
      api?: T['api'];
      context: IR.Context<OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X>;
      name: string;
      output: string;
    },
  ) {
    this.api = props.api ?? {};
    this.config = props.config;
    this.context = props.context;
    this.dependencies = props.dependencies;
    this.handler = props.handler;
    this.name = props.name;
    this.output = props.output;
    this.package = props.context.package;
  }

  createFile(file: IR.ContextFile) {
    return this.context.createFile({
      exportFromIndex: this.config.exportFromIndex,
      ...file,
    });
  }

  /**
   * Iterates over various input elements as specified by the event types, in
   * a specific order: servers, schemas, parameters, request bodies, then
   * operations.
   *
   * This ensures, for example, that schemas are always processed before
   * operations, which may reference them.
   *
   * @template T - The event type(s) to yield. Defaults to all event types.
   * @param events - The event types to walk over. If none are provided, all event types are included.
   * @param callback - Function to execute for each event.
   *
   * @example
   * // Iterate over all operations and schemas
   * plugin.forEach('operation', 'schema', (event) => {
   *   if (event.type === 'operation') {
   *     // handle operation
   *   } else if (event.type === 'schema') {
   *     // handle schema
   *   }
   * });
   */
  forEach<T extends WalkEventType = WalkEventType>(
    ...args: [
      ...events: ReadonlyArray<T>,
      callback: (event: WalkEvent<T>) => void,
    ]
  ): void {
    const events = args.slice(0, -1) as ReadonlyArray<T>;
    const callback = args[args.length - 1] as (event: WalkEvent<T>) => void;
    const eventSet = new Set(
      events.length
        ? events
        : ([
            'operation',
            'parameter',
            'requestBody',
            'schema',
            'server',
            'webhook',
          ] as ReadonlyArray<WalkEventType>),
    );

    if (eventSet.has('server') && this.context.ir.servers) {
      for (const server of this.context.ir.servers) {
        const event: WalkEvent<'server'> = { server, type: 'server' };
        try {
          callback(event as WalkEvent<T>);
        } catch (error) {
          this.forEachError(error, event);
        }
      }
    }

    if (eventSet.has('schema') && this.context.ir.components?.schemas) {
      for (const name in this.context.ir.components.schemas) {
        const event: WalkEvent<'schema'> = {
          $ref: `#/components/schemas/${name}`,
          name,
          schema: this.context.ir.components.schemas[name]!,
          type: 'schema',
        };
        try {
          callback(event as WalkEvent<T>);
        } catch (error) {
          this.forEachError(error, event);
        }
      }
    }

    if (eventSet.has('parameter') && this.context.ir.components?.parameters) {
      for (const name in this.context.ir.components.parameters) {
        const event: WalkEvent<'parameter'> = {
          $ref: `#/components/parameters/${name}`,
          name,
          parameter: this.context.ir.components.parameters[name]!,
          type: 'parameter',
        };
        try {
          callback(event as WalkEvent<T>);
        } catch (error) {
          this.forEachError(error, event);
        }
      }
    }

    if (
      eventSet.has('requestBody') &&
      this.context.ir.components?.requestBodies
    ) {
      for (const name in this.context.ir.components.requestBodies) {
        const event: WalkEvent<'requestBody'> = {
          $ref: `#/components/requestBodies/${name}`,
          name,
          requestBody: this.context.ir.components.requestBodies[name]!,
          type: 'requestBody',
        };
        try {
          callback(event as WalkEvent<T>);
        } catch (error) {
          this.forEachError(error, event);
        }
      }
    }

    if (eventSet.has('operation') && this.context.ir.paths) {
      for (const path in this.context.ir.paths) {
        const pathItem =
          this.context.ir.paths[path as keyof typeof this.context.ir.paths];
        for (const _method in pathItem) {
          const method = _method as keyof typeof pathItem;
          const event: WalkEvent<'operation'> = {
            method,
            operation: pathItem[method]!,
            path,
            type: 'operation',
          };
          try {
            callback(event as WalkEvent<T>);
          } catch (error) {
            this.forEachError(error, event);
          }
        }
      }
    }

    if (eventSet.has('webhook') && this.context.ir.webhooks) {
      for (const key in this.context.ir.webhooks) {
        const webhook = this.context.ir.webhooks[key];
        for (const _method in webhook) {
          const method = _method as keyof typeof webhook;
          const event: WalkEvent<'webhook'> = {
            key,
            method,
            operation: webhook[method]!,
            type: 'webhook',
          };
          try {
            callback(event as WalkEvent<T>);
          } catch (error) {
            this.forEachError(error, event);
          }
        }
      }
    }
  }

  private forEachError(error: unknown, event: WalkEvent) {
    const originalError =
      error instanceof Error ? error : new Error(String(error));
    throw new HeyApiError({
      args: [event],
      error: originalError,
      event: event.type,
      name: 'Error',
      pluginName: this.name,
    });
  }

  /**
   * Retrieves a registered plugin instance by its name from the context. This
   * allows plugins to access other plugins that have been registered in the
   * same context, enabling cross-plugin communication and dependencies.
   *
   * @param name Plugin name as defined in the configuration.
   * @returns The plugin instance if found, undefined otherwise.
   */
  getPlugin<T extends keyof PluginConfigMap>(
    name: T,
  ): T extends any ? PluginInstance<PluginConfigMap[T]> | undefined : never {
    return this.context.plugins[name] as any;
  }

  hooks = {
    operation: {
      isMutation: (operation: IR.OperationObject): boolean =>
        this.isOperationKind(operation, 'mutation'),
      isQuery: (operation: IR.OperationObject): boolean =>
        this.isOperationKind(operation, 'query'),
    },
  };

  private isOperationKind(
    operation: IR.OperationObject,
    kind: 'mutation' | 'query',
  ): boolean {
    const methodName = kind === 'query' ? 'isQuery' : 'isMutation';
    const isFnPlugin = this.config['~hooks']?.operations?.[methodName];
    const isFnPluginResult = isFnPlugin?.(operation);
    if (isFnPluginResult !== undefined) {
      return isFnPluginResult;
    }
    const getKindFnPlugin = this.config['~hooks']?.operations?.getKind;
    const getKindFnPluginResult = getKindFnPlugin?.(operation);
    if (getKindFnPluginResult !== undefined) {
      return getKindFnPluginResult.includes(kind);
    }
    const isFnParser =
      this.context.config.parser.hooks.operations?.[methodName];
    const isFnParserResult = isFnParser?.(operation);
    if (isFnParserResult !== undefined) {
      return isFnParserResult;
    }
    const getKindFnParser =
      this.context.config.parser.hooks.operations?.getKind;
    const getKindFnParserResult = getKindFnParser?.(operation);
    if (getKindFnParserResult !== undefined) {
      return getKindFnParserResult.includes(kind);
    }
    return defaultGetKind(operation).includes(kind);
  }

  /**
   * Executes plugin's handler function.
   */
  async run() {
    await this.handler({ plugin: this });
  }
}
