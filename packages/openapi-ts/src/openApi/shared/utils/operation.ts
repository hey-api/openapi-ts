import type { IR } from '../../../ir/types';
import { stringCase } from '../../../utils/stringCase';
import { sanitizeNamespaceIdentifier } from '../../common/parser/sanitize';
import type { State } from '../types/state';

/**
 * Verifies that operation ID is unique. For now, we only warn when this isn't
 * true as people like to not follow this part of the specification. In the
 * future, we should add a strict check and throw on duplicate identifiers.
 */
export const ensureUniqueOperationId = ({
  context,
  id,
  method,
  operationIds,
  path,
}: {
  context: IR.Context;
  id: string | undefined;
  method: IR.OperationObject['method'];
  operationIds: Map<string, string>;
  path: keyof IR.PathsObject;
}) => {
  if (!id) {
    return;
  }

  const operationKey = `${method.toUpperCase()} ${path}`;

  if (operationIds.has(id)) {
    if (context.config.logs.level !== 'silent') {
      // TODO: parser - support throw on duplicate
      console.warn(
        `❗️ Duplicate operationId: ${id} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
      );
    }
  } else {
    operationIds.set(id, operationKey);
  }
};

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
  context: IR.Context;
  count?: number;
  id: string | undefined;
  method: string;
  path: string;
  state: Pick<State, 'ids'>;
}): string => {
  let result: string;

  if (
    id &&
    (!context.config.plugins['@hey-api/sdk'] ||
      context.config.plugins['@hey-api/sdk'].operationId)
  ) {
    result = stringCase({
      case: 'camelCase',
      value: sanitizeNamespaceIdentifier(id),
    });
  } else {
    const urlWithoutPlaceholders = path
      .replace(/{(.*?)}/g, 'by-$1')
      // replace slashes with hyphens for camelcase method at the end
      .replace(/[/:+]/g, '-');

    result = stringCase({
      case: 'camelCase',
      value: `${method}-${urlWithoutPlaceholders}`,
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

  const operationKey = `${method.toUpperCase()} ${path}`;
  state.ids.set(result, operationKey);

  return result;
};
