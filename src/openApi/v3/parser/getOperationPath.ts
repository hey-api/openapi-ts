import { getOperationParameterName } from './getOperationParameterName';

/**
 * Get the final service path, this replaces the "{api-version}" placeholder
 * with a new template string placeholder so we can dynamically inject the
 * OpenAPI version without the need to hardcode this in the URL.
 * Plus we return the correct parameter names to replace in the URL.
 * @param path
 */
export const getOperationPath = (path: string): string => {
    return path
        .replace(/\{(.*?)\}/g, (_, w: string) => {
            return `\${${getOperationParameterName(w)}}`;
        })
        .replace('${apiVersion}', '${OpenAPI.VERSION}');
};
