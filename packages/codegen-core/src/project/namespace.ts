import type { SymbolKind } from '../symbols/types';

/**
 * Returns true if two declarations of given kinds
 * are allowed to share the same identifier in TypeScript.
 */
export function canShareName(a: SymbolKind, b: SymbolKind): boolean {
  // same-kind always valid for interfaces (merging)
  if (a === 'interface' && b === 'interface') return true;

  // type vs interface merges
  if (
    (a === 'interface' && b === 'type') ||
    (a === 'type' && b === 'interface')
  ) {
    return false; // TypeScript does NOT merge type-alias with interface.
  }

  // type vs type = conflict
  if (a === 'type' && b === 'type') return false;

  // interface vs class = allowed (declare-merge)
  if (
    (a === 'interface' && b === 'class') ||
    (a === 'class' && b === 'interface')
  ) {
    return true;
  }

  // enum vs namespace = allowed (merges into value+type)
  if (
    (a === 'enum' && b === 'namespace') ||
    (a === 'namespace' && b === 'enum')
  ) {
    return true;
  }

  // class vs namespace = allowed
  if (
    (a === 'class' && b === 'namespace') ||
    (a === 'namespace' && b === 'class')
  ) {
    return true;
  }

  // namespace vs namespace = allowed (merging)
  if (a === 'namespace' && b === 'namespace') return true;

  // enum vs enum = conflict IF values conflict (TypeScript flags duplicates)
  if (a === 'enum' && b === 'enum') return false;

  // function and namespace merge (namespace can augment function)
  if (
    (a === 'function' && b === 'namespace') ||
    (a === 'namespace' && b === 'function')
  ) {
    return true;
  }

  // these collide with each other in the value namespace
  const valueKinds = new Set<SymbolKind>(['class', 'enum', 'function', 'var']);

  const aInValue = valueKinds.has(a);
  const bInValue = valueKinds.has(b);

  if (aInValue && bInValue) return false;

  // type-only declarations do not collide with value-only declarations
  const typeKinds = new Set<SymbolKind>(['interface', 'type']);
  const aInType = typeKinds.has(a);
  const bInType = typeKinds.has(b);

  // if one is type-only and the other is value-only, they do NOT collide
  if (aInType !== bInType) return true;

  return true;
}
