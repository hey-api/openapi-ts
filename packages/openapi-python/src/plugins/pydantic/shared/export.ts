import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

// import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../py-dsl';
// import { identifiers } from '../v2/constants';
// import { pipesToNode } from './pipes';
import type { Ast, IrSchemaToAstOptions } from './types';

export function exportAst({
  // ast,
  plugin,
  // schema,
  // state,
  symbol,
}: IrSchemaToAstOptions & {
  ast: Ast;
  schema: IR.SchemaObject;
  symbol: Symbol;
}): void {
  // const v = plugin.external('valibot.v');
  const classDef = $.class(symbol);
  // .export()
  // .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
  // .$if(state.hasLazyExpression['~ref'], (c) =>
  //   c.type($.type(v).attr(ast.typeName || identifiers.types.GenericSchema)),
  // )
  // .assign(pipesToNode(ast.pipes, plugin));
  plugin.node(classDef);
  // if (schema.type === 'object' && schema.properties) {
  //   const baseModelSymbol = plugin.external('pydantic.BaseModel');
  //   const fieldSymbol = plugin.external('pydantic.Field');
  //   const classDef = $.class(symbol).extends(baseModelSymbol);

  //   if (plugin.config.comments && schema.description) {
  //     classDef.doc(schema.description);
  //   }

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
  //       classDef.do($.stmt($.expr(`${name}: ${typeAnnotation} = Field(${constraints})`)));
  //     } else {
  //       classDef.do($.stmt($.expr(`${name}: ${typeAnnotation}`)));
  //     }
  //   }

  //   plugin.node(classDef);
  // }
}
