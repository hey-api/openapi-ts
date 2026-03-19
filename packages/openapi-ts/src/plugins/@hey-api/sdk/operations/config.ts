import { log } from '@hey-api/codegen-core';
import type { OperationsStrategy, PluginContext } from '@hey-api/shared';

import type { UserConfig } from '../types';
import type { OperationsConfig, UserOperationsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function resolveOperations(config: Config, context: PluginContext): OperationsConfig {
  if (config.asClass !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'asClass',
      replacement: ['operations: { strategy: "byTags" }', 'operations: { strategy: "single" }'],
    });
  }

  if (config.classNameBuilder !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'classNameBuilder',
      replacement: 'operations: { containerName: "..." }',
    });
  }

  if (config.classStructure !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'classStructure',
      replacement: ['operations: { nesting: "operationId" }', 'operations: { nesting: "id" }'],
    });
  }

  if (config.instance !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'instance',
      replacement: `operations: { strategy: "single", containerName: "${config.instance || 'Name'}", methods: "instance" }`,
    });
  }

  if (config.methodNameBuilder !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'methodNameBuilder',
      replacement: 'operations: { methodName: "..." }',
    });
  }

  if (config.operationId !== undefined) {
    log.warnDeprecated({
      context: '@hey-api/sdk',
      field: 'operationId',
      replacement: ['operations: { nesting: "operationId" }', 'operations: { nesting: "id" }'],
    });
  }

  const legacy = mapLegacyToConfig(config);
  return normalizeConfig(config.operations, legacy, context);
}

function normalizeConfig(
  input: OperationsStrategy | UserOperationsConfig | undefined,
  legacy: Partial<OperationsConfig>,
  context: PluginContext,
): OperationsConfig {
  if (!input || typeof input === 'string' || typeof input === 'function') {
    input = { strategy: input };
  }

  const strategy = legacy.strategy ?? input.strategy ?? 'flat';
  const methods: OperationsConfig['methods'] = strategy === 'single' ? 'instance' : 'static';

  return context.valueToObject({
    defaultValue: {
      container: 'class',
      methods,
      nesting: 'operationId',
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
    } as UserOperationsConfig,
  }) as OperationsConfig;
}

function mapLegacyToConfig(config: Config): Partial<OperationsConfig> {
  let strategy: OperationsConfig['strategy'] | undefined;
  if (config.instance) {
    strategy = 'single';
  } else if (config.asClass) {
    strategy = 'byTags';
  } else if (config.instance === false || config.asClass === false) {
    strategy = 'flat';
  }

  let containerName: OperationsConfig['containerName'] | undefined;
  let segmentName: OperationsConfig['segmentName'] | undefined;
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

  let methods: OperationsConfig['methods'] | undefined;
  if (config.instance) {
    methods = 'instance';
  } else if (config.asClass) {
    methods = 'static';
  }

  let nesting: OperationsConfig['nesting'] | undefined;
  if (config.classStructure === 'off' || config.operationId === false) {
    nesting = 'id';
  } else if (config.classStructure === 'auto') {
    nesting = 'operationId';
  }

  let methodName: OperationsConfig['methodName'] | undefined;
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
