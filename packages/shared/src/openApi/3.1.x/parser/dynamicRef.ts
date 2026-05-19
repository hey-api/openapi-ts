import type { OpenAPIV3_1 } from '@hey-api/spec-types';

import type { Context } from '../../../ir/context';
import type { IR } from '../../../ir/types';
import { addItemsToSchema } from '../../../ir/utils';
import type { SchemaState } from '../../../openApi/shared/types/schema';
import { toCase } from '../../../utils/naming/naming';
import { isTopLevelComponent } from '../../../utils/ref';

const isSchemaObject = (value: unknown): value is OpenAPIV3_1.SchemaObject =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function getDynamicDefsBindings(
  schema: OpenAPIV3_1.SchemaObject,
): Array<[anchor: string, ref: string]> {
  if (!schema.$defs) return [];
  const entries: Array<[string, string]> = [];
  for (const defSchema of Object.values(schema.$defs)) {
    if (isSchemaObject(defSchema) && defSchema.$dynamicAnchor && defSchema.$ref) {
      entries.push([defSchema.$dynamicAnchor, defSchema.$ref]);
    }
  }
  return entries;
}

function anchorToParamName(anchor: string): string {
  const name = toCase(anchor, 'PascalCase');
  let sanitized = '';

  for (const char of name) {
    if (!sanitized) {
      sanitized += /^[$_\p{ID_Start}]$/u.test(char) ? char : '_';
    } else {
      sanitized += /^[$\u200c\u200d\p{ID_Continue}]$/u.test(char) ? char : '_';
    }
  }

  return sanitized || '_';
}

export function getTemplateParams(
  schema: OpenAPIV3_1.SchemaObject,
): ReadonlyArray<{ anchor: string; paramName: string }> {
  if (!schema.$defs) return [];
  const params: Array<{ anchor: string; paramName: string }> = [];
  const seen = new Set<string>();
  for (const defSchema of Object.values(schema.$defs)) {
    if (isSchemaObject(defSchema) && defSchema.$dynamicAnchor && !defSchema.$ref) {
      let paramName = anchorToParamName(defSchema.$dynamicAnchor);
      if (seen.has(paramName)) {
        let i = 2;
        while (seen.has(`${paramName}${i}`)) i++;
        paramName = `${paramName}${i}`;
      }
      seen.add(paramName);
      params.push({ anchor: defSchema.$dynamicAnchor, paramName });
    }
  }
  return params;
}

export function buildGenericRef({
  bindings,
  schema,
  targetRef,
  templateParams,
}: {
  bindings: ReadonlyArray<[anchor: string, ref: string]>;
  schema: OpenAPIV3_1.SchemaObject;
  targetRef: string;
  templateParams: ReadonlyArray<{ anchor: string; paramName: string }>;
}): IR.SchemaObject {
  const bindingMap = new Map(bindings);
  const typeArgs: Array<IR.SchemaObject> = [];

  for (const { anchor } of templateParams) {
    const ref = bindingMap.get(anchor);
    if (ref) {
      typeArgs.push({ $ref: ref });
    } else {
      typeArgs.push({ type: 'unknown' });
    }
  }

  const irSchema = initGenericRefIrSchema(schema);
  const irRefSchema: IR.SchemaObject = { $ref: targetRef };

  if (typeArgs.length) {
    irRefSchema.typeArgs = typeArgs;
  }

  if (schema.type && typeof schema.type !== 'string' && schema.type.includes('null')) {
    return addItemsToSchema({
      items: [irRefSchema, { type: 'null' }],
      schema: irSchema,
    });
  }

  return {
    ...irSchema,
    ...irRefSchema,
  };
}

function initGenericRefIrSchema(
  schema: OpenAPIV3_1.SchemaObject,
): Pick<IR.SchemaObject, 'deprecated' | 'description' | 'required' | 'title'> {
  const result: Pick<IR.SchemaObject, 'deprecated' | 'description' | 'required' | 'title'> = {};
  if (schema.deprecated !== undefined) result.deprecated = schema.deprecated;
  if (schema.description !== undefined) result.description = schema.description;
  if (schema.required !== undefined) result.required = schema.required;
  if (schema.title !== undefined) result.title = schema.title;
  return result;
}

export function hasDynamicRefBindings(schema: OpenAPIV3_1.SchemaObject): boolean {
  return getDynamicDefsBindings(schema).length > 0;
}

export function buildDynamicScope(
  schema: OpenAPIV3_1.SchemaObject,
  schemaRef?: string,
): Record<string, string> {
  const scope: Record<string, string> = {};

  if (schema.$dynamicAnchor) {
    if (schema.$ref) {
      scope[schema.$dynamicAnchor] = schema.$ref;
    } else if (schemaRef) {
      scope[schema.$dynamicAnchor] = schemaRef;
    }
  }

  for (const [anchor, ref] of getDynamicDefsBindings(schema)) {
    scope[anchor] = ref;
  }

  return scope;
}

export function buildCurrentDynamicScope({
  inheritedScope,
  schema,
}: {
  inheritedScope?: Record<string, string>;
  schema: OpenAPIV3_1.SchemaObject;
}): Record<string, string> {
  return {
    ...buildDynamicScope(schema),
    ...inheritedScope,
  };
}

export function resolveDynamicRef({
  dynamicRef,
  dynamicScope,
}: {
  dynamicRef: string;
  dynamicScope?: Record<string, string>;
}): string | undefined {
  if (!dynamicRef.startsWith('#') || dynamicRef.includes('/')) {
    return;
  }

  const anchorName = dynamicRef.slice(1);
  if (!anchorName) {
    return;
  }

  return dynamicScope?.[anchorName];
}

export function materializeDynamicRefBinding({
  context,
  schema,
}: {
  context: Context;
  schema: OpenAPIV3_1.SchemaObject;
}): OpenAPIV3_1.SchemaObject | undefined {
  if (
    !schema.$ref ||
    !schema.$defs ||
    !hasDynamicRefBindings(schema) ||
    !isTopLevelComponent(schema.$ref)
  ) {
    return;
  }

  const refSchema = context.resolveRef<OpenAPIV3_1.SchemaObject>(schema.$ref);
  const materializedSchema: OpenAPIV3_1.SchemaObject = {
    ...refSchema,
    ...schema,
  };
  if (refSchema.$defs && schema.$defs) {
    materializedSchema.$defs = {
      ...refSchema.$defs,
      ...schema.$defs,
    };
  }
  delete (materializedSchema as Record<string, unknown>).$ref;
  delete (materializedSchema as Record<string, unknown>).$dynamicAnchor;
  delete (materializedSchema as Record<string, unknown>).$id;

  return materializedSchema;
}

export function shouldInlineDynamicRefTarget({
  ref,
  refSchema,
  state,
}: {
  ref: string;
  refSchema: OpenAPIV3_1.SchemaObject;
  state: SchemaState;
}): boolean {
  return Boolean(
    refSchema.$dynamicAnchor &&
    state.dynamicScope?.[refSchema.$dynamicAnchor] &&
    state.dynamicScope[refSchema.$dynamicAnchor] !== ref &&
    !state.circularReferenceTracker.has(ref),
  );
}

export function containsRefTo(
  schema: OpenAPIV3_1.SchemaObject | undefined | null,
  ref: string,
): boolean {
  if (!schema) return false;
  if (schema.$ref === ref) return true;
  const composites: Array<unknown> | undefined = schema.allOf ?? schema.anyOf ?? schema.oneOf;
  if (Array.isArray(composites)) {
    for (const item of composites) {
      if (isSchemaObject(item)) {
        if (item.$ref === ref) return true;
        if (item.allOf || item.anyOf || item.oneOf) {
          if (containsRefTo(item, ref)) return true;
        }
      }
    }
  }
  return false;
}
