import path from 'node:path';

import type {
  IProject,
  Selector,
  Symbol,
  SymbolIn,
} from '@hey-api/codegen-core';

import { HeyApiError } from '~/error';
import type { MatchPointerToGroupFn, WalkOptions } from '~/graph';
import { walk } from '~/graph';
import type { IrTopLevelKind } from '~/ir/graph';
import {
  getIrPointerPriority,
  irTopLevelKinds,
  matchIrPointerToGroup,
  preferGroups,
} from '~/ir/graph';
import type { IR } from '~/ir/types';
import type { OpenApi } from '~/openApi/types';
import type { Hooks } from '~/parser/types/hooks';
import type { Plugin } from '~/plugins';
import type { PluginConfigMap } from '~/plugins/config';
import { jsonPointerToPath } from '~/utils/ref';

import type { BaseEvent, WalkEvent } from '../types/instance';

const defaultGetFilePath = (symbol: Symbol): string | undefined => {
  if (!symbol.meta?.pluginName || typeof symbol.meta.pluginName !== 'string') {
    return;
  }
  if (symbol.meta.pluginName.startsWith('@hey-api/client-')) {
    return 'client';
  }
  if (symbol.meta.pluginName === '@hey-api/typescript') {
    return 'types';
  }
  if (symbol.meta.pluginName.startsWith('@hey-api/')) {
    return symbol.meta.pluginName.split('/')[1];
  }
  return symbol.meta.pluginName;
};

const defaultGetKind: Required<Required<Hooks>['operations']>['getKind'] = (
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
      return;
  }
};

type EventHooks = {
  [K in keyof Required<NonNullable<Hooks['events']>>]: Array<
    NonNullable<NonNullable<Hooks['events']>[K]>
  >;
};

export class PluginInstance<T extends Plugin.Types = Plugin.Types> {
  api: T['api'];
  config: Omit<T['resolvedConfig'], 'name' | 'output'>;
  context: IR.Context;
  dependencies: Required<Plugin.Config<T>>['dependencies'] = [];
  private eventHooks: EventHooks;
  gen: IProject;
  private handler: Plugin.Config<T>['handler'];
  name: T['resolvedConfig']['name'];
  output: string;
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
      gen: IProject;
      name: string;
      output: string;
    },
  ) {
    this.api = props.api ?? {};
    this.config = props.config;
    this.context = props.context;
    this.dependencies = props.dependencies;
    this.eventHooks = this.buildEventHooks();
    this.gen = props.gen;
    this.handler = props.handler;
    this.name = props.name;
    this.output = props.output;
    this.package = props.context.package;
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
  forEach<T extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [
      ...events: ReadonlyArray<T>,
      callback: (event: WalkEvent<T>) => void,
    ]
  ): void;
  forEach<T extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [
      ...events: ReadonlyArray<T>,
      callback: (event: WalkEvent<T>) => void,
      options: WalkOptions<T>,
    ]
  ): void;
  forEach<T extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [
      ...events: ReadonlyArray<T>,
      callback: (event: WalkEvent<T>) => void,
      options: any,
    ]
  ): void {
    if (!this.context.graph) {
      throw new Error('No graph available in context');
    }

    let callback: (event: WalkEvent<T>) => void;
    let events: ReadonlyArray<T>;
    let options: WalkOptions<T> = {
      getPointerPriority: getIrPointerPriority,
      // default functions operate on the full union of kinds; cast them
      // to the WalkOptions generic to keep strict typing for callers.
      matchPointerToGroup:
        matchIrPointerToGroup as unknown as MatchPointerToGroupFn<T>,
      order: 'topological',
      preferGroups: preferGroups as unknown as ReadonlyArray<T>,
    };
    if (typeof args[args.length - 1] === 'function') {
      events = args.slice(0, -1);
      callback = args[args.length - 1];
    } else {
      events = args.slice(0, -2);
      callback = args[args.length - 2];
      options = {
        ...options,
        ...args[args.length - 1],
      };
    }
    const eventSet = new Set(events.length ? events : irTopLevelKinds);

    walk(
      this.context.graph,
      (pointer, nodeInfo) => {
        const result = matchIrPointerToGroup(pointer);
        if (!result.matched || !eventSet.has(result.kind)) return;
        let event: WalkEvent | undefined;
        const baseEvent: BaseEvent = {
          _path: jsonPointerToPath(pointer),
          pointer,
          tags: nodeInfo.tags,
        };
        switch (result.kind) {
          case 'operation':
            event = {
              ...baseEvent,
              method: nodeInfo.key as keyof IR.PathItemObject,
              operation: nodeInfo.node as IR.OperationObject,
              path: baseEvent._path[1] as string,
              type: result.kind,
            } satisfies WalkEvent<'operation'>;
            break;
          case 'parameter':
            event = {
              ...baseEvent,
              name: nodeInfo.key as string,
              parameter: nodeInfo.node as IR.ParameterObject,
              type: result.kind,
            } satisfies WalkEvent<'parameter'>;
            break;
          case 'requestBody':
            event = {
              ...baseEvent,
              name: nodeInfo.key as string,
              requestBody: nodeInfo.node as IR.RequestBodyObject,
              type: result.kind,
            } satisfies WalkEvent<'requestBody'>;
            break;
          case 'schema':
            event = {
              ...baseEvent,
              name: nodeInfo.key as string,
              schema: nodeInfo.node as IR.SchemaObject,
              type: result.kind,
            } satisfies WalkEvent<'schema'>;
            break;
          case 'server':
            event = {
              ...baseEvent,
              server: nodeInfo.node as IR.ServerObject,
              type: result.kind,
            } satisfies WalkEvent<'server'>;
            break;
          case 'webhook':
            event = {
              ...baseEvent,
              key: baseEvent._path[1] as string,
              method: nodeInfo.key as keyof IR.PathItemObject,
              operation: nodeInfo.node as IR.OperationObject,
              type: result.kind,
            } satisfies WalkEvent<'webhook'>;
            break;
        }
        if (event) {
          try {
            callback(event as WalkEvent<T>);
          } catch (error) {
            this.forEachError(error, event);
          }
        }
      },
      options,
    );
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

  /**
   * Retrieves a registered plugin instance by its name from the context. This
   * allows plugins to access other plugins that have been registered in the
   * same context, enabling cross-plugin communication and dependencies.
   *
   * @param name Plugin name as defined in the configuration.
   * @returns The plugin instance if found, throw otherwise.
   */
  getPluginOrThrow<T extends keyof PluginConfigMap>(
    name: T,
  ): T extends any ? PluginInstance<PluginConfigMap[T]> : never {
    const plugin = this.getPlugin(name);
    if (!plugin) throw new Error(`plugin not found ${name}`);
    return plugin as any;
  }

  getSymbol(symbolIdOrSelector: number | Selector): Symbol | undefined {
    return this.gen.symbols.get(symbolIdOrSelector);
  }

  hooks = {
    operation: {
      isMutation: (operation: IR.OperationObject): boolean =>
        this.isOperationKind(operation, 'mutation'),
      isQuery: (operation: IR.OperationObject): boolean =>
        this.isOperationKind(operation, 'query'),
    },
  };

  isSymbolRegistered(symbolIdOrSelector: number | Selector): boolean {
    return this.gen.symbols.isRegistered(symbolIdOrSelector);
  }

  hasSymbolValue(symbolIdOrSelector: number | Selector): boolean {
    const symbol = this.getSymbol(symbolIdOrSelector);
    return symbol ? this.gen.symbols.hasValue(symbol.id) : false;
  }

  referenceSymbol(symbolIdOrSelector: number | Selector): Symbol {
    return this.gen.symbols.reference(symbolIdOrSelector);
  }

  registerSymbol(symbol: SymbolIn): Symbol {
    const symbolIn: SymbolIn = {
      ...symbol,
      exportFrom:
        symbol.exportFrom ??
        (!symbol.external &&
        this.context.config.output.indexFile &&
        this.config.exportFromIndex
          ? ['index']
          : undefined),
      getFilePath: symbol.getFilePath ?? this.getSymbolFilePath.bind(this),
      meta: {
        pluginName: path.isAbsolute(this.name) ? 'custom' : this.name,
        ...symbol.meta,
      },
    };
    for (const hook of this.eventHooks['symbol:register:before']) {
      hook({ plugin: this, symbol: symbolIn });
    }
    const symbolOut = this.gen.symbols.register(symbolIn);
    for (const hook of this.eventHooks['symbol:register:after']) {
      hook({ plugin: this, symbol: symbolOut });
    }
    return symbolOut;
  }

  /**
   * Executes plugin's handler function.
   */
  async run(): Promise<void> {
    for (const hook of this.eventHooks['plugin:handler:before']) {
      hook({ plugin: this });
    }
    await this.handler({ plugin: this });
    for (const hook of this.eventHooks['plugin:handler:after']) {
      hook({ plugin: this });
    }
  }

  setSymbolValue(symbol: Symbol, value: unknown): void {
    for (const hook of this.eventHooks['symbol:setValue:before']) {
      hook({ plugin: this, symbol, value });
    }
    this.gen.symbols.setValue(symbol.id, value);
    for (const hook of this.eventHooks['symbol:setValue:after']) {
      hook({ plugin: this, symbol, value });
    }
  }

  private buildEventHooks(): EventHooks {
    const result: EventHooks = {
      'plugin:handler:after': [],
      'plugin:handler:before': [],
      'symbol:register:after': [],
      'symbol:register:before': [],
      'symbol:setValue:after': [],
      'symbol:setValue:before': [],
    };
    const scopes = [
      this.config['~hooks']?.events,
      this.context.config.parser.hooks.events,
    ];
    for (const scope of scopes) {
      if (!scope) continue;
      for (const [key, value] of Object.entries(scope)) {
        if (value) {
          result[key as keyof typeof result].push(value.bind(scope) as any);
        }
      }
    }
    return result;
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

  private getSymbolFilePath(symbol: Symbol): string | undefined {
    const hooks = [
      this.config['~hooks']?.symbols,
      this.context.config.parser.hooks.symbols,
    ];
    for (const hook of hooks) {
      const result = hook?.getFilePath?.(symbol);
      if (result !== undefined) return result;
    }
    return defaultGetFilePath(symbol);
  }

  private isOperationKind(
    operation: IR.OperationObject,
    kind: 'mutation' | 'query',
  ): boolean {
    const method = kind === 'query' ? 'isQuery' : 'isMutation';
    const hooks = [
      this.config['~hooks']?.operations?.[method],
      this.config['~hooks']?.operations?.getKind,
      this.context.config.parser.hooks.operations?.[method],
      this.context.config.parser.hooks.operations?.getKind,
      defaultGetKind,
    ];
    for (const hook of hooks) {
      if (hook) {
        const result = hook(operation);
        if (result !== undefined) {
          return typeof result === 'boolean' ? result : result.includes(kind);
        }
      }
    }
    return false;
  }
}
