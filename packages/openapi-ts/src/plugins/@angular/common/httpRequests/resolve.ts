import type {
  OperationPathStrategy,
  OperationStructureStrategy,
} from '~/openApi/shared/locations';
import { OperationPath, OperationStrategy } from '~/openApi/shared/locations';

import type { AngularCommonPlugin } from '../types';

function resolvePath(
  plugin: AngularCommonPlugin['Instance'],
): OperationPathStrategy {
  if (plugin.config.httpRequests.nesting === 'id') {
    return OperationPath.id();
  }

  if (plugin.config.httpRequests.nesting === 'operationId') {
    return OperationPath.fromOperationId({
      delimiters: plugin.config.httpRequests.nestingDelimiters,
    });
  }

  return plugin.config.httpRequests.nesting;
}

export function resolveHttpRequestsStrategy(
  plugin: AngularCommonPlugin['Instance'],
): OperationStructureStrategy {
  if (plugin.config.httpRequests.strategy === 'flat') {
    return OperationStrategy.flat({
      path: (operation) => [resolvePath(plugin)(operation).join('.')],
    });
  }

  if (plugin.config.httpRequests.strategy === 'single') {
    const root = plugin.config.httpRequests.containerName;
    return OperationStrategy.single({
      path: resolvePath(plugin),
      root: typeof root.name === 'string' ? root.name : (root.name?.('') ?? ''),
    });
  }

  if (plugin.config.httpRequests.strategy === 'byTags') {
    return OperationStrategy.byTags({
      fallback: plugin.config.httpRequests.strategyDefaultTag,
      path: resolvePath(plugin),
    });
  }

  return plugin.config.httpRequests.strategy;
}
