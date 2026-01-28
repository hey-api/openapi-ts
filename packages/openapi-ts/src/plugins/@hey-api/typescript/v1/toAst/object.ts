import { fromRef, ref } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import type { SchemaWithType } from '~/plugins';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): TypeTsDsl => {
  // TODO: parser - handle constants
  const shape = $.type.object();
  const required = schema.required ?? [];
  let indexSchemas: Array<IR.SchemaObject> = [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const propertyType = irSchemaToAst({
      optional: !required,
      plugin,
      schema: property,
      state: {
        ...state,
        path: ref([...fromRef(state.path), 'properties', name]),
      },
    });
    const isRequired = required.includes(name);
    shape.prop(name, (p) =>
      p
        .$if(createSchemaComment(property), (p, v) => p.doc(v))
        .readonly(property.accessScope === 'read')
        .required(isRequired)
        .type(propertyType),
    );
    indexSchemas.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  // include pattern value schemas into the index union
  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const ir = schema.patternProperties[pattern]!;
      indexSchemas.unshift(ir);
    }
  }

  const hasPatterns =
    !!schema.patternProperties &&
    Object.keys(schema.patternProperties).length > 0;

  const addPropsRaw = schema.additionalProperties;
  const addPropsObj =
    addPropsRaw !== false && addPropsRaw
      ? (addPropsRaw as IR.SchemaObject)
      : undefined;
  const shouldCreateIndex =
    hasPatterns ||
    (!!addPropsObj && (addPropsObj.type !== 'never' || !indexSchemas.length));

  if (shouldCreateIndex) {
    // only inject additionalProperties when it's not "never"
    const addProps = addPropsObj;
    if (addProps && addProps.type !== 'never') {
      indexSchemas.unshift(addProps);
    } else if (
      !hasPatterns &&
      !indexSchemas.length &&
      addProps &&
      addProps.type === 'never'
    ) {
      // keep "never" only when there are NO patterns and NO explicit properties
      indexSchemas = [addProps];
    }

    if (hasOptionalProperties) {
      indexSchemas.push({ type: 'undefined' });
    }

    const type =
      indexSchemas.length === 1
        ? irSchemaToAst({
            plugin,
            schema: indexSchemas[0]!,
            state,
          })
        : irSchemaToAst({
            plugin,
            schema: { items: indexSchemas, logicalOperator: 'or' },
            state,
          });

    if (schema.propertyNames?.$ref) {
      return $.type
        .mapped('key')
        .key(
          irSchemaToAst({
            plugin,
            schema: {
              $ref: schema.propertyNames.$ref,
            },
            state,
          }),
        )
        .optional()
        .type(type);
    }

    shape.idxSig('key', (i) => i.key('string').type(type));
  }

  return shape;
};
