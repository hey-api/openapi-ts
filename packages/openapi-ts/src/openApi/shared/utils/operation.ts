import type { IRContext } from '../../../ir/context';
import { camelCase } from '../../../utils/camelCase';
import { sanitizeNamespaceIdentifier } from '../../common/parser/sanitize';

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
  context: IRContext;
  id: string | undefined;
  method: string;
  path: string;
}): string => {
  if (
    id &&
    (!context.config.plugins['@hey-api/sdk'] ||
      context.config.plugins['@hey-api/sdk'].operationId)
  ) {
    return camelCase({
      input: sanitizeNamespaceIdentifier(id),
    });
  }

  const urlWithoutPlaceholders = path
    .replace(/{(.*?)}/g, 'by-$1')
    // replace slashes with hyphens for camelcase method at the end
    .replace(/[/:]/g, '-');

  return camelCase({
    input: `${method}-${urlWithoutPlaceholders}`,
  });
};
