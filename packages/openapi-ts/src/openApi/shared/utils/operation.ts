import type { IR } from '../../../ir/types';
import { stringCase } from '../../../utils/stringCase';
import { sanitizeNamespaceIdentifier } from '../../common/parser/sanitize';

/**
 * Verifies that operation ID is unique. For now, we only warn when this isn't
 * true as people like to not follow this part of the specification. In the
 * future, we should add a strict check and throw on duplicate identifiers.
 */
export const ensureUniqueOperationId = ({
  id,
  method,
  operationIds,
  path,
}: {
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
    // TODO: parser - support throw on duplicate
    console.warn(
      `❗️ Duplicate operationId: ${id} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
    );
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
  id,
  method,
  path,
}: {
  context: IR.Context;
  id: string | undefined;
  method: string;
  path: string;
}): string => {
  if (
    id &&
    (!context.config.plugins['@hey-api/sdk'] ||
      context.config.plugins['@hey-api/sdk'].operationId)
  ) {
    return stringCase({
      case: 'camelCase',
      value: sanitizeNamespaceIdentifier(id),
    });
  }

  const urlWithoutPlaceholders = path
    .replace(/{(.*?)}/g, 'by-$1')
    // replace slashes with hyphens for camelcase method at the end
    .replace(/[/:]/g, '-');

  return stringCase({
    case: 'camelCase',
    value: `${method}-${urlWithoutPlaceholders}`,
  });
};
