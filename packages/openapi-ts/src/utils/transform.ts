import { ensureValidTypeScriptJavaScriptIdentifier } from '../openApi/common/parser/sanitize';
import { camelCase } from './camelCase';
import { getConfig } from './config';
import { reservedWordsRegExp } from './reservedWords';

export const transformServiceName = (name: string) => {
  const config = getConfig();
  if (config.services.name) {
    return config.services.name.replace('{{name}}', name);
  }
  return name;
};

export const transformTypeName = (name: string) => {
  const config = getConfig();
  if (config.types.name === 'PascalCase') {
    return camelCase({
      input: name,
      pascalCase: true,
    });
  }
  return name;
};

/**
 * This method is meant to be used to process definition names
 * and return a cleaned up, transformed version that is legal
 * to use in the output code.
 *
 * For example, a definition with name "400" would result in "_400",
 * "import" would result in "_import", etc. This also respects the
 * casing configuration for types.
 *
 * @param name Name of the definition in OpenAPI specification.
 * @returns A cleaned up, transformed name usable in output code.
 */
export const cleanAndTransformTypeName = (name: string) => {
  const transformed = transformTypeName(name);
  const cleaned = ensureValidTypeScriptJavaScriptIdentifier(transformed);
  const result = cleaned.replace(reservedWordsRegExp, '_$1');
  return result;
};
