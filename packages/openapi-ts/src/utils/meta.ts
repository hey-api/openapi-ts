import { getType } from '../openApi';
import { refParametersPartial, refSchemasPartial } from './const';
import { reservedJavaScriptKeywordsRegExp } from './regexp';
import { cleanAndTransformTypeName } from './transform';

export const getParametersMeta = (definitionName: string) => {
  const definitionType = getType({ type: definitionName });
  /**
   * Prefix parameter names to avoid name conflicts with schemas.
   * Assuming people are mostly interested in importing schema types
   * and don't care about this name as much. It should be resolved in
   * a cleaner way, there just isn't a good deduplication strategy
   * today. This is a workaround in the meantime, hopefully reducing
   * the chance of conflicts.
   *
   * Example where this would break: schema named `ParameterFoo` and
   * parameter named `Foo` (this would transform to `ParameterFoo`)
   *
   * Note: there's a related code to this workaround in `getType()`
   * method that needs to be cleaned up when this is addressed.
   */
  const name = `Parameter${definitionType.base.replace(reservedJavaScriptKeywordsRegExp, '_$1')}`;
  const meta = {
    $ref: refParametersPartial + definitionName,
    name,
  };
  return meta;
};

/**
 * @param definitionName Name of the schema definition in OpenAPI specification.
 * @returns meta object
 */
export const getSchemasMeta = (definitionName: string) => {
  const name = cleanAndTransformTypeName(definitionName);
  const meta = {
    $ref: refSchemasPartial + definitionName,
    name,
  };
  return meta;
};
