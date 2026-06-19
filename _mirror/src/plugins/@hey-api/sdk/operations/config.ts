import type { UserConfig } from '../types';
import type { OperationsConfig } from './types';

type Config = Omit<UserConfig, 'name'>;

export function mapLegacyToConfig(config: Config): Partial<OperationsConfig> {
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
