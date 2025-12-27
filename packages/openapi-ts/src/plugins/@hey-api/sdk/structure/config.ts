import { log } from '@hey-api/codegen-core';

import type { PluginContext } from '~/plugins/types';

import type { UserConfig } from '../types';
import type {
  StructureConfig,
  StructureStrategy,
  UserStructureConfig,
} from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveStructure(
  config: Config,
  context: PluginContext,
): StructureConfig {
  if (config.asClass !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'asClass',
      replacement: [
        'structure.operations: { strategy: "byTags" }',
        'structure.operations: { strategy: "single" }',
      ],
    });
  }

  if (config.classNameBuilder !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'classNameBuilder',
      replacement: 'structure.operations: { containerName: "..." }',
    });
  }

  if (config.classStructure !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'classStructure',
      replacement: [
        'structure.operations: { nesting: "operationId" }',
        'structure.operations: { nesting: "id" }',
      ],
    });
  }

  if (config.instance !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'instance',
      replacement: `structure.operations: { strategy: "single", containerName: "${config.instance || 'Name'}", methods: "instance" }`,
    });
  }

  if (config.methodNameBuilder !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'methodNameBuilder',
      replacement: 'structure.operations: { methodName: "..." }',
    });
  }

  if (config.operationId !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'operationId',
      replacement: [
        'structure.operations: { nesting: "operationId" }',
        'structure.operations: { nesting: "id" }',
      ],
    });
  }

  const legacy = mapLegacyToConfig(config);
  return config.structure?.operations
    ? normalizeStructureConfig(config.structure.operations, legacy, context)
    : context.valueToObject({
        defaultValue: {
          container: 'class',
          containerName: {},
          methodName: {},
          methods: 'instance',
          nesting: 'operationId',
          nestingDelimiters: /[./]/,
          segmentName: {},
          strategy: 'flat',
          strategyDefaultTag: 'default',
        },
        value: legacy as StructureConfig,
      });
}

function normalizeStructureConfig(
  input: StructureStrategy | UserStructureConfig,
  legacy: Partial<StructureConfig>,
  context: PluginContext,
): StructureConfig {
  if (typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  }

  const strategy = legacy.strategy ?? input.strategy ?? 'flat';

  return context.valueToObject({
    defaultValue: {
      container: 'class',
      methods: 'instance',
      nesting: strategy === 'flat' ? 'id' : 'operationId',
      nestingDelimiters: /[./]/,
      strategy,
      strategyDefaultTag: 'default',
    },
    mappers: {
      object(value) {
        value.containerName = context.valueToObject({
          defaultValue:
            strategy === 'single'
              ? { casing: 'PascalCase', name: 'Sdk' }
              : { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.containerName,
        });
        value.methodName = context.valueToObject({
          defaultValue: { casing: 'camelCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.methodName,
        });
        value.segmentName = context.valueToObject({
          defaultValue: { casing: 'PascalCase' },
          mappers: {
            function: (name) => ({ name }),
            string: (name) => ({ name }),
          },
          value: value.segmentName,
        });
        return value;
      },
    },
    value: {
      ...legacy,
      ...input,
    } as UserStructureConfig,
  }) as StructureConfig;
}

function mapLegacyToConfig(config: Config): Partial<StructureConfig> {
  // TODO: refactor...
  // Set default classNameBuilder based on client type
  if (config.classNameBuilder === '{{name}}') {
    if (config.client === '@hey-api/client-angular') {
      config.classNameBuilder = '{{name}}Service';
    }
  }

  let strategy: StructureConfig['strategy'] | undefined;
  if (config.instance) {
    strategy = 'single';
  } else if (config.asClass) {
    strategy = 'byTags';
  } else if (config.instance === false || config.asClass === false) {
    strategy = 'flat';
  }

  let containerName: StructureConfig['containerName'] | undefined;
  let segmentName: StructureConfig['segmentName'] | undefined;
  if (config.instance) {
    let name = typeof config.instance === 'string' ? config.instance : 'Sdk';
    segmentName = { casing: 'PascalCase' };
    if (config.classNameBuilder) {
      segmentName.name = config.classNameBuilder;
      if (typeof config.classNameBuilder === 'string') {
        name = config.classNameBuilder.replace('{{name}}', name);
      } else {
        name = config.classNameBuilder(name);
      }
    }
    containerName = { casing: 'PascalCase', name };
  } else if (config.classNameBuilder) {
    containerName = {
      casing: 'PascalCase',
      name: config.classNameBuilder,
    };
    segmentName = { ...containerName };
  } else if (config.asClass) {
    containerName = { casing: 'PascalCase' };
    segmentName = { ...containerName };
  }

  let methods: StructureConfig['methods'] | undefined;
  if (config.instance) {
    methods = 'instance';
  } else if (config.asClass) {
    methods = 'static';
  }

  let nesting: StructureConfig['nesting'] | undefined;
  if (config.classStructure === 'off' || config.operationId === false) {
    nesting = 'id';
  } else if (config.classStructure === 'auto') {
    nesting = 'operationId';
  }

  let methodName: StructureConfig['methodName'] | undefined;
  if (config.methodNameBuilder) {
    methodName = {
      casing: 'camelCase',
      name: config.methodNameBuilder,
    };
  }

  return {
    containerName,
    methodName,
    methods,
    nesting,
    segmentName,
    strategy,
  };
}
