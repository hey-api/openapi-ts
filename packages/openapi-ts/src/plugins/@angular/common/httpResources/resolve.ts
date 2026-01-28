import type {
  OperationPathStrategy,
  OperationStructureStrategy,
} from '@hey-api/shared';
import { OperationPath, OperationStrategy } from '@hey-api/shared';

import type { AngularCommonPlugin } from '../types';

function resolvePath(
  plugin: AngularCommonPlugin['Instance'],
): OperationPathStrategy {
  if (plugin.config.httpResources.nesting === 'id') {
    return OperationPath.id();
  }

  if (plugin.config.httpResources.nesting === 'operationId') {
    return OperationPath.fromOperationId({
      delimiters: plugin.config.httpResources.nestingDelimiters,
      fallback: OperationPath.id(),
    });
  }

  return plugin.config.httpResources.nesting;
}

export function resolveHttpResourcesStrategy(
  plugin: AngularCommonPlugin['Instance'],
): OperationStructureStrategy {
  if (plugin.config.httpResources.strategy === 'flat') {
    return OperationStrategy.flat({
      path: (operation) => [resolvePath(plugin)(operation).join('.')],
    });
  }

  if (plugin.config.httpResources.strategy === 'single') {
    const root = plugin.config.httpResources.containerName;
    return OperationStrategy.single({
      path: resolvePath(plugin),
      root: typeof root.name === 'string' ? root.name : (root.name?.('') ?? ''),
    });
  }

  if (plugin.config.httpResources.strategy === 'byTags') {
    return OperationStrategy.byTags({
      fallback: plugin.config.httpResources.strategyDefaultTag,
      path: resolvePath(plugin),
    });
  }

  return plugin.config.httpResources.strategy;
}
