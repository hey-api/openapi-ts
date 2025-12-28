import type {
  OperationPathStrategy,
  OperationStructureStrategy,
} from '~/openApi/shared/locations';
import { OperationPath, OperationStrategies } from '~/openApi/shared/locations';

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
    return OperationStrategies.flat({
      path: resolvePath(plugin),
    });
  }

  if (plugin.config.operations.strategy === 'single') {
    const root = plugin.config.operations.containerName;
    return OperationStrategies.single({
      path: resolvePath(plugin),
      root: typeof root.name === 'string' ? root.name : (root.name?.('') ?? ''),
    });
  }

  if (plugin.config.operations.strategy === 'byTags') {
    return OperationStrategies.byTags({
      fallback: plugin.config.operations.strategyDefaultTag,
      path: resolvePath(plugin),
    });
  }

  return plugin.config.operations.strategy;
}
