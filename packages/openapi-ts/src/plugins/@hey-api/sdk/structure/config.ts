import type { PluginContext } from '~/plugins/types';
import type { NamingConfig, NamingRule } from '~/utils/naming';
import { resolveNaming } from '~/utils/naming';

import type { UserConfig } from '../types';
import type {
  StructureConfig,
  StructureStrategy,
  UserStructureConfig,
} from './types';

type Config = Omit<UserConfig, 'name'>;

// container: 'class',
// containerName: {},
// defaultTag: 'default',
// delimiters: /[./]/,
// methodName: {},
// methods: 'instance',
// nesting: 'operationId',
// segmentName: {},
// strategy: 'flat',

export function resolveStructure(
  config: Config,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: PluginContext,
): StructureConfig {
  // if (plugin.config.instance) {
  //   if (typeof plugin.config.instance !== 'string') {
  //     plugin.config.instance = 'Sdk';
  //   }

  //   plugin.config.asClass = true;
  // } else {
  //   plugin.config.instance = '';
  // }

  // // Set default classNameBuilder based on client type
  // if (plugin.config.classNameBuilder === '{{name}}') {
  //   if (plugin.config.client === '@hey-api/client-angular') {
  //     plugin.config.classNameBuilder = '{{name}}Service';
  //   }
  // }

  // Check for deprecated options and warn
  if (config.asClass !== undefined) {
    console.warn(
      '`asClass` is deprecated. Use `grouping: "byTags"` or `grouping: "single"` instead.',
    );
  }

  if (config.instance !== undefined) {
    console.warn(
      '`instance` is deprecated. Use `grouping: { strategy: "single", containerName: "Name", methods: "instance" }` instead.',
    );
  }

  if (config.classStructure !== undefined) {
    console.warn(
      '`classStructure` is deprecated. Use `grouping: { nesting: "operationId" }` or `grouping: { nesting: "id" }` instead.',
    );
  }

  if (config.classNameBuilder !== undefined) {
    console.warn(
      '`classNameBuilder` is deprecated. Use `grouping.containerName` instead.',
    );
  }

  if (config.methodNameBuilder !== undefined) {
    console.warn(
      '`methodNameBuilder` is deprecated. Use `grouping.methodName` instead.',
    );
  }

  if (config.operationId !== undefined) {
    console.warn(
      '`operationId` is deprecated. Use `grouping: { nesting: "operationId" }` or `grouping: { nesting: "id" }` instead.',
    );
  }

  // If new grouping config is provided, use it
  if (config.structure !== undefined) {
    return normalizeStructureConfig(config.structure);
  }

  // Otherwise, map legacy config to new grouping config
  return mapLegacyToGrouping(config);
}

function normalizeStructureConfig(
  input: StructureStrategy | UserStructureConfig,
): StructureConfig {
  // String shorthand
  if (typeof input === 'string') {
    return {
      container: 'class',
      containerName: input === 'single' ? { name: 'Sdk' } : {},
      defaultTag: 'default',
      delimiters: /[./]/,
      methodName: {},
      methods: 'instance',
      nesting: 'operationId',
      segmentName: {},
      strategy: input,
    };
  }

  // Custom function
  if (typeof input === 'function') {
    return {
      container: 'class',
      containerName: {},
      defaultTag: 'default',
      delimiters: /[./]/,
      methodName: {},
      methods: 'instance',
      nesting: 'operationId',
      segmentName: {},
      strategy: input,
    };
  }

  // Full config object
  const strategy = input.strategy ?? 'flat';

  return {
    container: input.container ?? 'class',
    containerName: resolveContainerName(input.containerName, strategy),
    defaultTag: input.defaultTag ?? 'default',
    delimiters: input.delimiters ?? /[./]/,
    methodName: resolveNaming(input.methodName),
    methods: input.methods ?? 'instance',
    nesting: input.nesting ?? 'operationId',
    segmentName: resolveNaming(input.segmentName),
    strategy,
  };
}

function resolveContainerName(
  input: NamingRule | undefined,
  strategy: StructureStrategy,
): NamingConfig {
  const resolved = resolveNaming(input);

  // Default name for 'single' strategy
  if (strategy === 'single' && !resolved.name) {
    resolved.name = 'Sdk';
  }

  return resolved;
}

function mapLegacyToGrouping(config: Config): StructureConfig {
  // Determine strategy from legacy options
  let strategy: StructureStrategy = 'flat';

  if (config.asClass) {
    strategy = config.instance ? 'single' : 'byTags';
  }

  // Determine container name
  let containerName: NamingConfig = {};

  if (config.instance && typeof config.instance === 'string') {
    containerName = { name: config.instance };
  } else if (config.classNameBuilder) {
    containerName = resolveNaming(config.classNameBuilder);
  }

  if (strategy === 'single' && !containerName.name) {
    containerName.name = 'Sdk';
  }

  // Determine method name
  const methodName: NamingConfig = config.methodNameBuilder
    ? resolveNaming(config.methodNameBuilder)
    : {};

  // Determine nesting
  let nesting: 'operationId' | 'id' = 'operationId';

  if (config.classStructure === 'off' || config.operationId === false) {
    nesting = 'id';
  }

  // Determine methods style
  const methods = config.instance ? 'instance' : 'static';

  return {
    container: 'class',
    containerName,
    defaultTag: 'default',
    delimiters: /[./]/,
    methodName,
    methods,
    nesting,
    segmentName: {},
    strategy,
  };
}
