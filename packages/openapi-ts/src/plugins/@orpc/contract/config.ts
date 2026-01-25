import type { IR } from '~/ir/types';
import { definePluginConfig } from '~/plugins/shared/utils/config';
import { toCase } from '~/utils/naming';

import { handler } from './plugin';
import type { OrpcPlugin } from './types';

// Default: extract first path segment and convert to camelCase
// "/chat-messages/{id}" → "chatMessages"
function defaultGroupKeyBuilder(operation: IR.OperationObject): string {
  const segment = operation.path.split('/').filter(Boolean)[0] || 'common';
  return toCase(segment, 'camelCase');
}

// Build patterns from segment name (camelCase group key)
// "chatMessages" → ["ChatMessages", "ChatMessage"]
function buildGroupPatterns(groupKey: string): string[] {
  const patterns: string[] = [];
  const pascalKey = toCase(groupKey, 'PascalCase');
  patterns.push(pascalKey);

  // Singular form: "ChatMessages" → "ChatMessage"
  if (pascalKey.endsWith('s') && !pascalKey.endsWith('ss')) {
    patterns.push(pascalKey.slice(0, -1));
  }

  return patterns;
}

// Default: simplify operationId by removing redundant group-based patterns
// e.g., "sendChatMessage" with groupKey "chatMessages" → "send"
// e.g., "getConversationsList" with groupKey "conversations" → "getList"
function defaultOperationKeyBuilder(
  operationId: string,
  groupKey: string,
): string {
  const patternsToRemove = buildGroupPatterns(groupKey);

  let simplified = operationId;

  // Remove patterns iteratively
  for (const pattern of patternsToRemove) {
    const regex = new RegExp(pattern, 'g');
    const result = simplified.replace(regex, '');
    if (result !== simplified && result.length > 0) {
      simplified = result;
    }
  }

  // Ensure first char is lowercase
  simplified = simplified.charAt(0).toLowerCase() + simplified.slice(1);

  // Handle edge cases where we end up with just HTTP method or too short
  if (!simplified || simplified.length < 2) {
    return operationId.charAt(0).toLowerCase() + operationId.slice(1);
  }

  return simplified;
}

export const defaultConfig: OrpcPlugin['Config'] = {
  config: {
    contractNameBuilder: (id: string) => `${id}Contract`,
    defaultTag: 'default',
    exportFromIndex: false,
    groupKeyBuilder: defaultGroupKeyBuilder,
    operationKeyBuilder: defaultOperationKeyBuilder,
    routerName: 'router',
    validator: 'zod',
  },
  handler,
  name: '@orpc/contract',
  resolveConfig: (plugin) => {
    plugin.config.exportFromIndex ??= false;
    plugin.config.contractNameBuilder ??= (id: string) => `${id}Contract`;
    plugin.config.defaultTag ??= 'default';
    plugin.config.groupKeyBuilder ??= defaultGroupKeyBuilder;
    plugin.config.operationKeyBuilder ??= defaultOperationKeyBuilder;
    plugin.config.routerName ??= 'router';

    plugin.config.validator ??= 'zod';
    plugin.dependencies.add(plugin.config.validator);
  },
  tags: ['client'],
};

/**
 * Type helper for oRPC plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
