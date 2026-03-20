import type { OperationPathStrategy, OperationStructureStrategy } from '@hey-api/shared';
import { OperationPath, OperationStrategy } from '@hey-api/shared';

import type { OrpcPlugin } from '../types';

function resolvePath(plugin: OrpcPlugin['Instance']): OperationPathStrategy {
  if (plugin.config.contracts.nesting === 'id') {
    return OperationPath.id();
  }

  if (plugin.config.contracts.nesting === 'operationId') {
    return OperationPath.fromOperationId({
      delimiters: plugin.config.contracts.nestingDelimiters,
      fallback: OperationPath.id(),
    });
  }

  return plugin.config.contracts.nesting;
}

export function resolveStrategy(plugin: OrpcPlugin['Instance']): OperationStructureStrategy {
  if (plugin.config.contracts.strategy === 'flat') {
    return OperationStrategy.flat({
      path: (operation) => [resolvePath(plugin)(operation).join('.')],
    });
  }

  if (plugin.config.contracts.strategy === 'single') {
    const root = plugin.config.contracts.containerName;
    return OperationStrategy.single({
      path: resolvePath(plugin),
      root: typeof root.name === 'string' ? root.name : (root.name?.('') ?? ''),
    });
  }

  if (plugin.config.contracts.strategy === 'byTags') {
    return OperationStrategy.byTags({
      fallback: plugin.config.contracts.strategyDefaultTag,
      path: resolvePath(plugin),
    });
  }

  return plugin.config.contracts.strategy;
}
