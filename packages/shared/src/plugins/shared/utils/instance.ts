import path from 'node:path';

import type {
  IProject,
  Node,
  Symbol,
  SymbolIdentifier,
  SymbolIn,
  SymbolMeta,
} from '@hey-api/codegen-core';

import type { Dependency } from '../../../config/utils/dependencies';
import { HeyApiError } from '../../../error';
import type { MatchPointerToGroupFn, WalkOptions } from '../../../graph';
import { walk } from '../../../graph';
import type { Context } from '../../../ir/context';
import type { IrTopLevelKind } from '../../../ir/graph';
import {
  getIrPointerPriority,
  irTopLevelKinds,
  matchIrPointerToGroup,
  preferGroups,
} from '../../../ir/graph';
import type { ExampleIntent } from '../../../ir/intents';
import type { IR } from '../../../ir/types';
import type { Hooks } from '../../../parser/hooks';
import type { Plugin, PluginConfigMap } from '../../../plugins/types';
import { jsonPointerToPath } from '../../../utils/ref';
import type { BaseEvent, WalkEvent } from '../types/instance';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginInstanceTypes {}

/**
 * Resolves the Node type, falling back to base Node if not augmented.
 */
type ResolvedNode = 'Node' extends keyof PluginInstanceTypes
  ? // @ts-expect-error ts cannot resolve conditional types properly here
    PluginInstanceTypes['Node']
  : Node;

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

const defaultGetKind: Required<Required<Hooks>['operations']>['getKind'] = (operation) => {
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
  config: Omit<T['resolvedConfig'], 'name'>;
  context: Context;
  dependencies: Required<Plugin.Config<T>>['dependencies'] = [];
  private eventHooks: EventHooks;
  gen: IProject;
  private handler: Plugin.Config<T>['handler'];
  name: T['resolvedConfig']['name'];
  /**
   * The package metadata and utilities for the current context, constructed
   * from the provided dependencies. Used for managing package-related
   * information such as name, version, and dependency resolution during
   * code generation.
   */
  package: Dependency;

  constructor(
    props: Pick<Required<Plugin.Config<T>>, 'config' | 'dependencies' | 'handler'> & {
      api?: T['api'];
      context: Context;
      gen: IProject;
      name: string;
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
    this.package = props.context.package;
  }

  external(
    resource: Required<SymbolMeta>['resource'],
    meta?: Omit<SymbolMeta, 'category' | 'resource'>,
  ): Symbol {
    return this.gen.symbols.reference({
      ...meta,
      category: 'external',
      resource,
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
   * @template TKind - The event type(s) to yield. Defaults to all event types.
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
  forEach<TKind extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [...events: ReadonlyArray<TKind>, callback: (event: WalkEvent<TKind>) => void]
  ): void;
  forEach<TKind extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [
      ...events: ReadonlyArray<TKind>,
      callback: (event: WalkEvent<TKind>) => void,
      options: WalkOptions<TKind>,
    ]
  ): void;
  forEach<TKind extends IrTopLevelKind = IrTopLevelKind>(
    ...args: [
      ...events: ReadonlyArray<TKind>,
      callback: (event: WalkEvent<TKind>) => void,
      options: any,
    ]
  ): void {
    if (!this.context.graph) {
      throw new Error('No graph available in context');
    }

    let callback: (event: WalkEvent<TKind>) => void;
    let events: ReadonlyArray<TKind>;
    let options: WalkOptions<TKind> = {
      getPointerPriority: getIrPointerPriority,
      // default functions operate on the full union of kinds; cast them
      // to the WalkOptions generic to keep strict typing for callers.
      matchPointerToGroup: matchIrPointerToGroup as unknown as MatchPointerToGroupFn<TKind>,
      order: 'topological',
      preferGroups: preferGroups as unknown as ReadonlyArray<TKind>,
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
          tags: nodeInfo.tags ? Array.from(nodeInfo.tags) : undefined,
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
            callback(event as WalkEvent<TKind>);
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
  getPlugin<TName extends keyof PluginConfigMap>(
    name: TName,
  ): TName extends any ? PluginInstance<PluginConfigMap[TName]> | undefined : never {
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
  getPluginOrThrow<TName extends keyof PluginConfigMap>(
    name: TName,
  ): TName extends any ? PluginInstance<PluginConfigMap[TName]> : never {
    const plugin = this.getPlugin(name);
    if (!plugin) throw new Error(`plugin not found ${name}`);
    return plugin as any;
  }

  getSymbol(identifier: SymbolIdentifier): Symbol | undefined {
    return this.gen.symbols.get(identifier);
  }

  hooks = {
    operation: {
      isMutation: (operation: IR.OperationObject): boolean =>
        this.isOperationKind(operation, 'mutation'),
      isQuery: (operation: IR.OperationObject): boolean => this.isOperationKind(operation, 'query'),
    },
  };

  /**
   * Registers an intent in the context's intent list.
   *
   * @param intent The intent to be registered.
   * @returns void
   */
  intent(intent: ExampleIntent): void {
    this.context.intents.push(intent);
  }

  isSymbolRegistered(identifier: SymbolIdentifier): boolean {
    return this.gen.symbols.isRegistered(identifier);
  }

  /**
   * Sets or adds a node to the project graph.
   *
   * @param node The node to be added or updated in the project graph.
   * @param index The index at which to update the node. If undefined, the node will be added.
   * @returns The index of the added node or void if updated.
   */
  node<T extends number | undefined = undefined>(
    node: Node | null,
    index?: T,
  ): T extends number ? void : number {
    for (const hook of this.eventHooks['node:set:before']) {
      hook({ node, plugin: this as any });
    }
    const result =
      index !== undefined ? this.gen.nodes.update(index, node) : this.gen.nodes.add(node);
    for (const hook of this.eventHooks['node:set:after']) {
      hook({ node, plugin: this as any });
    }
    return result as T extends number ? void : number;
  }

  querySymbol(filter: SymbolMeta): Symbol<ResolvedNode> | undefined {
    return this.gen.symbols.query(filter)[0] as Symbol<ResolvedNode> | undefined;
  }

  referenceSymbol(meta: SymbolMeta): Symbol<ResolvedNode> {
    return this.gen.symbols.reference(meta) as Symbol<ResolvedNode>;
  }

  /**
   * @deprecated use `plugin.symbol()` instead
   */
  registerSymbol(symbol: SymbolIn): Symbol<ResolvedNode> {
    return this.symbol(symbol.name, symbol) as Symbol<ResolvedNode>;
  }

  /**
   * Executes plugin's handler function.
   */
  async run(): Promise<void> {
    for (const hook of this.eventHooks['plugin:handler:before']) {
      hook({ plugin: this as any });
    }
    await this.handler({ plugin: this });
    for (const hook of this.eventHooks['plugin:handler:after']) {
      hook({ plugin: this as any });
    }
  }

  symbol(name: SymbolIn['name'], symbol?: Omit<SymbolIn, 'name'>): Symbol<ResolvedNode> {
    const symbolIn: SymbolIn = {
      ...symbol,
      meta: {
        pluginName: path.isAbsolute(this.name) ? 'custom' : this.name,
        ...symbol?.meta,
      },
      name,
    };
    if (symbolIn.getExportFromFilePath === undefined) {
      symbolIn.getExportFromFilePath = this.getSymbolExportFromFilePath.bind(this);
    }
    if (symbolIn.getFilePath === undefined) {
      symbolIn.getFilePath = this.getSymbolFilePath.bind(this);
    }
    for (const hook of this.eventHooks['symbol:register:before']) {
      hook({ plugin: this as any, symbol: symbolIn });
    }
    const symbolOut = this.gen.symbols.register(symbolIn);
    for (const hook of this.eventHooks['symbol:register:after']) {
      hook({ plugin: this as any, symbol: symbolOut });
    }
    return symbolOut as Symbol<ResolvedNode>;
  }

  /**
   * Registers a symbol only if it does not already exist based on the provided
   * metadata. This prevents duplicate symbols from being created in the project.
   */
  symbolOnce(name: SymbolIn['name'], symbol?: Omit<SymbolIn, 'name'>): Symbol {
    const meta = {
      ...symbol?.meta,
    };
    if (symbol?.external) {
      meta.category = 'external';
      meta.resource = symbol.external;
    }
    const existing = this.querySymbol(meta);
    if (existing) return existing;
    return this.symbol(name, { ...symbol, meta });
  }

  private buildEventHooks(): EventHooks {
    const result: EventHooks = {
      'node:set:after': [],
      'node:set:before': [],
      'plugin:handler:after': [],
      'plugin:handler:before': [],
      'symbol:register:after': [],
      'symbol:register:before': [],
    };
    const scopes = [this.config['~hooks']?.events, this.context.config.parser.hooks.events];
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
    const originalError = error instanceof Error ? error : new Error(String(error));
    throw new HeyApiError({
      args: [event],
      error: originalError,
      event: event.type,
      name: 'Error',
      pluginName: this.name,
    });
  }

  private getSymbolExportFromFilePath(symbol: Symbol): ReadonlyArray<string> | undefined {
    const hooks = [this.config['~hooks']?.symbols, this.context.config.parser.hooks.symbols];
    for (const hook of hooks) {
      const result = hook?.getExportFromFilePath?.(symbol);
      if (result !== undefined) return result;
    }

    // default logic below
    const entryFile = this.context.config.output.indexFile ?? this.context.config.output.entryFile;
    if (symbol.external || !entryFile) return;

    const includeInEntry = this.config.exportFromIndex ?? this.config.includeInEntry;
    if (
      (typeof includeInEntry === 'boolean' && !includeInEntry) ||
      (typeof includeInEntry === 'function' && !includeInEntry(symbol))
    ) {
      return;
    }

    const language = symbol.node?.language;
    if (!language) return;

    const moduleEntryName = this.gen.moduleEntryNames[language];
    if (!moduleEntryName) return;

    return [moduleEntryName];
  }

  private getSymbolFilePath(symbol: Symbol): string | undefined {
    const hooks = [this.config['~hooks']?.symbols, this.context.config.parser.hooks.symbols];
    for (const hook of hooks) {
      const result = hook?.getFilePath?.(symbol);
      if (result !== undefined) return result;
    }
    return defaultGetFilePath(symbol);
  }

  private isOperationKind(operation: IR.OperationObject, kind: 'mutation' | 'query'): boolean {
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
