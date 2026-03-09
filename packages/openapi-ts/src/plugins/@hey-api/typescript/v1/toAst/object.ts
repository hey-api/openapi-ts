import { ref } from '@hey-api/codegen-core';
import type { IR, SchemaWithType, Walker } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { createSchemaComment } from '../../../../../plugins/shared/utils/schema';
import { $ } from '../../../../../ts-dsl';
import type { HeyApiTypeScriptPlugin } from '../../shared/types';
import type { TypeScriptResult } from '../../shared/types';

export function objectToAst({
  plugin,
  schema,
  walk,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
}): TypeScriptResult['type'] {
  const shape = $.type.object();
  const required = schema.required ?? [];
  let indexSchemas: Array<IR.SchemaObject> = [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const propertyResult = walk(property, { path: ref([]), plugin });
    const isRequired = required.includes(name);
    shape.prop(name, (p) =>
      p
        .$if(plugin.config.comments && createSchemaComment(property), (p, v) => p.doc(v))
        .readonly(property.accessScope === 'read')
        .required(isRequired)
        .type(propertyResult.type),
    );
    indexSchemas.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const ir = schema.patternProperties[pattern]!;
      indexSchemas.unshift(ir);
    }
  }

  const hasPatterns =
    !!schema.patternProperties && Object.keys(schema.patternProperties).length > 0;

  const addPropsRaw = schema.additionalProperties;
  const addPropsObj =
    addPropsRaw !== false && addPropsRaw ? (addPropsRaw as IR.SchemaObject) : undefined;
  const shouldCreateIndex =
    hasPatterns || (!!addPropsObj && (addPropsObj.type !== 'never' || !indexSchemas.length));

  if (shouldCreateIndex) {
    const addProps = addPropsObj;
    if (addProps && addProps.type !== 'never') {
      if (addProps.type === 'unknown') {
        const patternSchemas: Array<IR.SchemaObject> = schema.patternProperties
          ? Object.values(schema.patternProperties)
          : [];
        indexSchemas = [addProps, ...patternSchemas];
      } else {
        indexSchemas.unshift(addProps);
      }
    } else if (!hasPatterns && !indexSchemas.length && addProps && addProps.type === 'never') {
      indexSchemas = [addProps];
    }

    if (hasOptionalProperties && addProps?.type !== 'unknown') {
      indexSchemas.push({ type: 'undefined' });
    }

    if (indexSchemas.length > 0) {
      const unionSchema: IR.SchemaObject =
        indexSchemas.length === 1
          ? indexSchemas[0]!
          : deduplicateSchema({ schema: { items: indexSchemas, logicalOperator: 'or' } });

      const indexType = walk(unionSchema, { path: ref([]), plugin }).type;

      if (schema.propertyNames?.$ref) {
        const propertyNamesResult = walk(
          { $ref: schema.propertyNames.$ref },
          { path: ref([]), plugin },
        );
        return $.type.mapped('key').key(propertyNamesResult.type).optional().type(indexType);
      }

      shape.idxSig('key', (i) => i.key('string').type(indexType));
    }
  }

  return shape;
}
