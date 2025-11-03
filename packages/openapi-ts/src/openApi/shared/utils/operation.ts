import type { Context } from '~/ir/context';
import { createOperationKey } from '~/ir/operation';
import { sanitizeNamespaceIdentifier } from '~/openApi/common/parser/sanitize';
import { stringCase } from '~/utils/stringCase';

import type { State } from '../types/state';

export const httpMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
] as const;

/**
 * Returns an operation ID to use across the application. By default, we try
 * to use the provided ID. If it's not provided or the SDK is configured
 * to exclude it, we generate operation ID from its location.
 */
export const operationToId = ({
  context,
  count = 1,
  id,
  method,
  path,
  state,
}: {
  context: Context;
  count?: number;
  id: string | undefined;
  method: string;
  path: string;
  state: Pick<State, 'ids'>;
}): string => {
  let result: string;

  const { output } = context.config;
  const targetCase =
    (output !== undefined && typeof output === 'object' && 'case' in output
      ? output.case
      : undefined) ?? 'camelCase';

  if (
    id &&
    (!context.config.plugins['@hey-api/sdk'] ||
      context.config.plugins['@hey-api/sdk'].config.operationId)
  ) {
    result = stringCase({
      case: targetCase,
      value: sanitizeNamespaceIdentifier(id),
    });
  } else {
    const pathWithoutPlaceholders = path
      .replace(/{(.*?)}/g, 'by-$1')
      // replace slashes with hyphens for camelcase method at the end
      .replace(/[/:+]/g, '-');

    result = stringCase({
      case: targetCase,
      value: `${method}-${pathWithoutPlaceholders}`,
    });
  }

  if (count > 1) {
    result = `${result}${count}`;
  }

  if (state.ids.has(result)) {
    return operationToId({
      context,
      count: count + 1,
      id,
      method,
      path,
      state,
    });
  }

  state.ids.set(result, createOperationKey({ method, path }));

  return result;
};
