import type { Parser } from '../../../config/parser/types';
import { applyNaming } from '../../../utils/naming/naming';
import { getSchemasObject } from '../utils/transforms';
import { specToSchemasPointerNamespace } from './utils';

type SchemaNameConfig = Parser['transforms']['schemaName'];

/**
 * Recursively walks the entire spec object and replaces all $ref strings
 * according to the provided rename mapping.
 *
 * @param node - Current node being visited
 * @param renameMap - Map from old pointer to new pointer
 */
const rewriteRefs = (node: unknown, renameMap: Record<string, string>) => {
  if (node instanceof Array) {
    node.forEach((item) => rewriteRefs(item, renameMap));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string' && value in renameMap) {
        // Replace the $ref with the new name
        (node as Record<string, unknown>)[key] = renameMap[value];
      } else {
        rewriteRefs(value, renameMap);
      }
    }
  }
};

/**
 * Applies the schema name transform to rename schema component keys and
 * update all $ref pointers throughout the spec.
 *
 * This transform:
 * 1. Iterates all schema keys in components.schemas (or definitions for Swagger 2.0)
 * 2. Applies the name transformer to compute new names
 * 3. Handles name collisions (skips rename if new name already exists)
 * 4. Renames schema keys in the schemas object
 * 5. Updates all $ref pointers throughout the spec to use the new names
 *
 * @param schemaName - The schema name transformer
 * @param spec - The OpenAPI spec object to transform
 */
export const schemasTransform = ({
  schemaName,
  spec,
}: {
  schemaName: SchemaNameConfig;
  spec: unknown;
}) => {
  if (!schemaName) {
    return;
  }

  const schemasObj = getSchemasObject(spec);
  if (!schemasObj) {
    return;
  }

  const schemasPointerNamespace = specToSchemasPointerNamespace(spec);
  if (!schemasPointerNamespace) {
    return;
  }

  // Build rename map: oldPointer -> newPointer
  const renameMap: Record<string, string> = {};
  const newNames = new Set<string>();

  // Create a simple config object for applyNaming
  const namingConfig =
    typeof schemaName === 'function' ? { name: schemaName } : { name: schemaName };

  // First pass: compute all new names and check for collisions
  for (const oldName of Object.keys(schemasObj)) {
    const newName = applyNaming(oldName, namingConfig);

    // Skip if name doesn't change
    if (newName === oldName) {
      newNames.add(oldName);
      continue;
    }

    // Skip if new name collides with an existing schema or another renamed schema
    if (oldName in schemasObj && newName in schemasObj && oldName !== newName) {
      // Collision with existing schema - skip rename
      newNames.add(oldName);
      continue;
    }

    if (newNames.has(newName)) {
      // Collision with another renamed schema - skip rename
      newNames.add(oldName);
      continue;
    }

    // Record the rename
    renameMap[`${schemasPointerNamespace}${oldName}`] = `${schemasPointerNamespace}${newName}`;
    newNames.add(newName);
  }

  // Second pass: rename schema keys
  // We need to be careful about the order to avoid overwriting
  const renamedSchemas: Record<string, unknown> = {};
  const processedOldNames = new Set<string>();

  for (const [oldPointer, newPointer] of Object.entries(renameMap)) {
    const oldName = oldPointer.slice(schemasPointerNamespace.length);
    const newName = newPointer.slice(schemasPointerNamespace.length);

    // Store the schema under the new name
    renamedSchemas[newName] = schemasObj[oldName];
    processedOldNames.add(oldName);
  }

  // Add all schemas that weren't renamed
  for (const [name, schema] of Object.entries(schemasObj)) {
    if (!processedOldNames.has(name)) {
      renamedSchemas[name] = schema;
    }
  }

  // Replace the entire schemas object with the renamed version
  Object.keys(schemasObj).forEach((key) => delete schemasObj[key]);
  Object.assign(schemasObj, renamedSchemas);

  // Third pass: rewrite all $ref pointers throughout the spec
  if (Object.keys(renameMap).length > 0) {
    rewriteRefs(spec, renameMap);
  }
};
