import { HeyApiError } from '../../../error';
import type { IR } from '../../../ir/types';
import type { OpenApi } from '../../../openApi/types';
import type { Config } from '../../../types/config';
import type { BaseConfig, Plugin } from '../../types';
import type { WalkEvent, WalkEventType } from '../types/instance';

export class PluginInstance<PluginConfig extends BaseConfig = BaseConfig> {
  public config: Plugin.Config<PluginConfig>['config'];
  public context: IR.Context;
  public dependencies: Required<Plugin.Config<PluginConfig>>['dependencies'] =
    [];
  private handler: Plugin.Config<PluginConfig>['handler'];
  public name: Plugin.Config<PluginConfig>['name'];
  public output: Required<PluginConfig>['output'];

  public constructor(
    props: Pick<
      Required<Plugin.Config<PluginConfig>>,
      'config' | 'dependencies' | 'handler'
    > &
      Pick<Required<PluginConfig>, 'output'> & {
        context: IR.Context<OpenApi.V2_0_X | OpenApi.V3_0_X | OpenApi.V3_1_X>;
        name: string;
      },
  ) {
    this.config = props.config;
    this.context = props.context;
    this.dependencies = props.dependencies;
    this.handler = props.handler;
    this.name = props.name;
    this.output = props.output;
  }

  public createFile(file: IR.ContextFile) {
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
  public forEach<T extends WalkEventType = WalkEventType>(
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
  public getPlugin<T extends keyof Config['plugins']>(
    name: T,
  ): IR.Context['plugins'][T] {
    return this.context.plugins[name];
  }

  /**
   * Executes plugin's handler function.
   */
  public async run() {
    await this.handler({ plugin: this });
  }
}
