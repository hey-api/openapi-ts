import type {
  OperationPathStrategy,
  OperationStructureStrategy,
} from '~/openApi/shared/locations';
import { OperationPath, OperationStrategy } from '~/openApi/shared/locations';

import type { HeyApiSdkPlugin } from '../types';

function resolvePath(
  plugin: HeyApiSdkPlugin['Instance'],
): OperationPathStrategy {
  if (plugin.config.operations.nesting === 'id') {
    return OperationPath.id();
  }

  if (plugin.config.operations.nesting === 'operationId') {
    return OperationPath.fromOperationId({
      delimiters: plugin.config.operations.nestingDelimiters,
    });
  }

  return plugin.config.operations.nesting;
}

export function resolveStrategy(
  plugin: HeyApiSdkPlugin['Instance'],
): OperationStructureStrategy {
  if (plugin.config.operations.strategy === 'flat') {
    return OperationStrategy.flat({
      path: (operation) => [resolvePath(plugin)(operation).join('.')],
    });
  }

  if (plugin.config.operations.strategy === 'single') {
    const root = plugin.config.operations.containerName;
    return OperationStrategy.single({
      path: resolvePath(plugin),
      root: typeof root.name === 'string' ? root.name : (root.name?.('') ?? ''),
    });
  }

  if (plugin.config.operations.strategy === 'byTags') {
    return OperationStrategy.byTags({
      fallback: plugin.config.operations.strategyDefaultTag,
      path: resolvePath(plugin),
    });
  }

  return plugin.config.operations.strategy;
}
