import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { SchemaWithType } from '~/plugins';
import { fieldName } from '~/plugins/shared/utils/case';
import { toRef } from '~/plugins/shared/utils/refs';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import type { Property } from '~/tsc';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const objectToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'object'>;
}): ts.TypeNode => {
  // TODO: parser - handle constants
  let indexKey: ts.TypeReferenceNode | undefined;
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  let indexPropertyItems: Array<IR.SchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const propertyType = irSchemaToAst({
      plugin,
      schema: property,
      state: {
        ...state,
        path: toRef([...state.path.value, 'properties', name]),
      },
    });
    const isRequired = required.includes(name);
    schemaProperties.push({
      comment: createSchemaComment({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name: fieldName({ context: plugin.context, name }),
      type: propertyType,
    });
    indexPropertyItems.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  // include pattern value schemas into the index union
  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const ir = schema.patternProperties[pattern]!;
      indexPropertyItems.unshift(ir);
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
    (!!addPropsObj &&
      (addPropsObj.type !== 'never' || !indexPropertyItems.length));

  if (shouldCreateIndex) {
    // only inject additionalProperties when it’s not "never"
    const addProps = addPropsObj;
    if (addProps && addProps.type !== 'never') {
      indexPropertyItems.unshift(addProps);
    } else if (
      !hasPatterns &&
      !indexPropertyItems.length &&
      addProps &&
      addProps.type === 'never'
    ) {
      // keep "never" only when there are NO patterns and NO explicit properties
      indexPropertyItems = [addProps];
    }

    if (hasOptionalProperties) {
      indexPropertyItems.push({
        type: 'undefined',
      });
    }

    indexProperty = {
      isRequired: !schema.propertyNames,
      name: 'key',
      type:
        indexPropertyItems.length === 1
          ? irSchemaToAst({
              plugin,
              schema: indexPropertyItems[0]!,
              state,
            })
          : irSchemaToAst({
              plugin,
              schema: { items: indexPropertyItems, logicalOperator: 'or' },
              state,
            }),
    };

    if (schema.propertyNames?.$ref) {
      indexKey = irSchemaToAst({
        plugin,
        schema: {
          $ref: schema.propertyNames.$ref,
        },
        state,
      }) as ts.TypeReferenceNode;
    }
  }

  return tsc.typeInterfaceNode({
    indexKey,
    indexProperty,
    properties: schemaProperties,
    useLegacyResolution: false,
  });
};
