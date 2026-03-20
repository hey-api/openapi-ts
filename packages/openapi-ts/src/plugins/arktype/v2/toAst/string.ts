import type { SchemaWithType } from '@hey-api/shared';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../../constants';
import type { ArktypeResult } from '../../shared/types';
import { $ } from '../../../../ts-dsl';

export const stringToAst = ({
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): ArktypeResult => {
  const result: Partial<ArktypeResult> = {};

  if (typeof schema.const === 'string') {
    result.def = schema.const;
    result.expression = $.literal(`'${schema.const}'`);
    return result as ArktypeResult;
  }

  let def = identifiers.primitives.string;

  if (schema.format) {
    switch (schema.format) {
      case 'date':
      case 'date-time':
      case 'time':
        def = `${def}.${identifiers.string.date}.${identifiers.string.iso}`;
        break;
      case 'email':
        def = `${def}.${identifiers.string.email}`;
        break;
      case 'ipv4':
        def = `${def}.${identifiers.string.ip}.${identifiers.string.v4}`;
        break;
      case 'ipv6':
        def = `${def}.${identifiers.string.ip}.${identifiers.string.v6}`;
        break;
      case 'uri':
        def = `${def}.${identifiers.string.url}`;
        break;
      case 'uuid':
        def = `${def}.${identifiers.string.uuid}`;
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    def = `${schema.minLength} <= ${def} <= ${schema.maxLength}`;
  } else {
    if (schema.maxLength !== undefined) {
      def = `${def} <= ${schema.maxLength}`;

      if (schema.minLength !== undefined) {
        def = `${schema.minLength} <= ${def}`;
      }
    } else if (schema.minLength !== undefined) {
      def = `${def} >= ${schema.minLength}`;
    }
  }

  if (schema.pattern) {
    def = `/${schema.pattern}/`;
  }

  result.def = def;
  result.expression = $.literal(def);

  return result as ArktypeResult;
};