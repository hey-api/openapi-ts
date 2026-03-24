import { Logger } from '@hey-api/codegen-core';

import type { Context } from '../../../../ir/context';
import { PluginInstance } from '../instance';

const createMockContext = (): Context =>
  ({
    config: {
      input: [],
      logs: {},
      output: { case: undefined, entryFile: 'index.ts', path: '' },
      parser: { hooks: {} },
      pluginOrder: [],
      plugins: {},
    },
    dependencies: {},
    intents: [],
    logger: new Logger(),
    package: {
      dependencies: {},
      name: 'test-plugin',
      version: '1.0.0',
    },
    plugins: {},
  }) as unknown as Context;

const createMockGen = () => {
  let id = 1;
  const symbols = {
    get: vi.fn(),
    isRegistered: vi.fn(),
    query: vi.fn((): any[] => []),
    reference: vi.fn((meta) => ({ ...meta, id: 1 })),
    register: vi.fn((symbol) => ({ ...symbol, id: id++ })),
    registered: vi.fn(() => [].values()),
  };
  return {
    defaultFileName: 'main',
    defaultNameConflictResolver: vi.fn(),
    extensions: {},
    files: vi.fn(),
    moduleEntryNames: {},
    nameConflictResolvers: {},
    nodes: {
      add: vi.fn(),
      update: vi.fn(),
    },
    plan: vi.fn(),
    render: vi.fn(),
    symbols,
  };
};

describe('PluginInstance.symbol', () => {
  it('registers a basic symbol with name and meta', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: { exportFromIndex: false },
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    const result = instance.symbol('Foo', { meta: { category: 'type' } });

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ category: 'type', pluginName: '@hey-api/test' }),
        name: 'Foo',
      }),
    );
    expect(result).toBeDefined();
    expect(result.name).toBe('Foo');
  });

  it('sets default pluginName to "custom" for absolute paths', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '/absolute/path/plugin',
    });

    instance.symbol('Bar');

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ pluginName: 'custom' }),
      }),
    );
  });

  it('sets default getExportFromFilePath when not provided', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('Baz');

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        getExportFromFilePath: expect.any(Function),
      }),
    );
  });

  it('sets default getFilePath when not provided', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('Qux');

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        getFilePath: expect.any(Function),
      }),
    );
  });

  it('uses provided getExportFromFilePath when provided', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const customFn = vi.fn(() => ['exported']);
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('Test', { getExportFromFilePath: customFn });

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        getExportFromFilePath: customFn,
      }),
    );
  });

  it('uses provided getFilePath when provided', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const customFn = vi.fn(() => 'custom/path');
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('Test', { getFilePath: customFn });

    expect(gen.symbols.register).toHaveBeenCalledWith(
      expect.objectContaining({
        getFilePath: customFn,
      }),
    );
  });

  it('deduplicates external symbols', () => {
    const existingSymbol = {
      id: 1,
      meta: { category: 'external', resource: 'lib' },
      name: 'ExternalLib',
    } as any;
    const gen = createMockGen();
    gen.symbols.query.mockReturnValueOnce([existingSymbol]);
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    const result = instance.symbol('ExternalLib', { external: 'lib' });

    expect(gen.symbols.query).toHaveBeenCalledWith({
      category: 'external',
      resource: 'lib.ExternalLib',
    });
    expect(gen.symbols.register).not.toHaveBeenCalled();
    expect(result).toBe(existingSymbol);
  });

  it('registers new symbol when external symbol not found', () => {
    const gen = createMockGen();
    gen.symbols.query.mockReturnValueOnce([]);
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('NewExternal', { external: 'lib' });

    expect(gen.symbols.register).toHaveBeenCalled();
  });

  it('executes symbol:register:before hook', () => {
    const beforeHook = vi.fn();
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: { '~hooks': { events: { 'symbol:register:before': beforeHook } } },
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('HookTest');

    expect(beforeHook).toHaveBeenCalledWith({
      plugin: instance,
      symbol: expect.objectContaining({ name: 'HookTest' }),
    });
  });

  it('executes symbol:register:after hook', () => {
    const afterHook = vi.fn();
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: { '~hooks': { events: { 'symbol:register:after': afterHook } } },
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbol('HookTestAfter');

    expect(afterHook).toHaveBeenCalledWith({
      plugin: instance,
      symbol: expect.objectContaining({ name: 'HookTestAfter' }),
    });
  });
});

describe('PluginInstance.symbolOnce', () => {
  it('returns existing symbol if found by name and meta', () => {
    const existingSymbol = {
      id: 1,
      meta: { category: 'type', pluginName: '@hey-api/test' },
      name: 'ExistingSymbol',
    } as any;
    const gen = createMockGen();
    gen.symbols.query.mockReturnValueOnce([existingSymbol]);
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    const result = instance.symbolOnce('ExistingSymbol', { meta: { category: 'type' } });

    expect(gen.symbols.query).toHaveBeenCalledWith({ category: 'type' });
    expect(gen.symbols.register).not.toHaveBeenCalled();
    expect(result).toBe(existingSymbol);
  });

  it('registers new symbol when not found', () => {
    const gen = createMockGen();
    gen.symbols.query.mockReturnValueOnce([]);
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbolOnce('NewSymbol', { meta: { category: 'type' } });

    expect(gen.symbols.register).toHaveBeenCalled();
  });

  it('delegates to symbol() for external symbols', () => {
    const gen = createMockGen();
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    instance.symbolOnce('ExternalSym', { external: 'lib' });

    expect(gen.symbols.query).toHaveBeenCalledWith({
      category: 'external',
      resource: 'lib.ExternalSym',
    });
  });

  it('does not deduplicate when meta is not provided', () => {
    const gen = createMockGen();
    gen.symbols.query.mockReturnValue([]);
    const context = createMockContext();
    const instance = new PluginInstance({
      config: {},
      context,
      dependencies: [],
      gen: gen as any,
      handler: vi.fn(),
      name: '@hey-api/test',
    });

    const result1 = instance.symbolOnce('RepeatableSymbol');
    const result2 = instance.symbolOnce('RepeatableSymbol');

    expect(result1).not.toBe(result2);
    expect(gen.symbols.register).toHaveBeenCalledTimes(2);
  });
});
