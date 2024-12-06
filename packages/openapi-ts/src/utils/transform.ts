import { ensureValidTypeScriptJavaScriptIdentifier } from '../openApi';
import type { Config } from '../types/config';
import { getConfig } from './config';
import { reservedJavaScriptKeywordsRegExp } from './regexp';
import { stringCase } from './stringCase';

export const transformServiceName = ({
  config,
  name,
}: {
  config: Config;
  name: string;
}) => {
  if (config.plugins['@hey-api/sdk']?.serviceNameBuilder) {
    return config.plugins['@hey-api/sdk'].serviceNameBuilder.replace(
      '{{name}}',
      name,
    );
  }

  return name;
};

export const transformTypeName = (name: string) => {
  const config = getConfig();
  if (config.plugins['@hey-api/typescript']?.style === 'PascalCase') {
    return stringCase({
      case: 'PascalCase',
      value: name,
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
  const result = cleaned.replace(reservedJavaScriptKeywordsRegExp, '_$1');
  return result;
};
