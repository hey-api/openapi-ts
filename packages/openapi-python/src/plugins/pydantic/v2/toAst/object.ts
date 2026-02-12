// import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
// import { irSchemaToAst } from '../plugin';

export function objectToAst({
  plugin,
  // schema,
  // state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): Ast {
  const symbolBaseModel = plugin.external('pydantic.BaseModel');
  // const fieldSymbol = plugin.external('pydantic.Field');
  const symbolTemp = plugin.symbol('temp');

  const classDef = $.class(symbolTemp).extends(symbolBaseModel);
  console.log(classDef);

  // if (schema.properties) {
  //   for (const name in schema.properties) {
  //     const property = schema.properties[name]!;
  //     const isOptional = !schema.required?.includes(name);

  //     const propertyAst = irSchemaToAst({
  //       optional: isOptional,
  //       plugin,
  //       schema: property,
  //       state: {
  //         ...state,
  //         path: ref([...fromRef(state.path), 'properties', name]),
  //       },
  //     });

  //     let typeAnnotation = propertyAst.typeAnnotation;

  //     if (isOptional && !typeAnnotation.startsWith('Optional[')) {
  //       typeAnnotation = `Optional[${typeAnnotation}]`;
  //     }

  //     if (propertyAst.fieldConstraints && Object.keys(propertyAst.fieldConstraints).length > 0) {
  //       const constraints = Object.entries(propertyAst.fieldConstraints)
  //         .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
  //         .join(', ');
  //       classDef.do($.expr(`${name}: ${typeAnnotation} = Field(${constraints})`));
  //     } else {
  //       classDef.do($.expr(`${name}: ${typeAnnotation}`));
  //     }
  //   }
  // }

  return {
    // expression: classDef,
    fieldConstraints: {},
    hasLazyExpression: false,
    models: [],
    // pipes: [],
    typeAnnotation: 'DynamicModel',
    typeName: 'DynamicModel',
  };
}
