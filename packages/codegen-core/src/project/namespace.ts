import type { SymbolKind } from '../symbols/types';

const kindRank: Record<SymbolKind, number> = {
  class: 3,
  enum: 4,
  function: 5,
  interface: 1,
  namespace: 0,
  type: 2,
  var: 6,
};

/**
 * Returns true if two declarations of given kinds
 * are allowed to share the same identifier in TypeScript.
 */
export function canShareName(a: SymbolKind, b: SymbolKind): boolean {
  // sort based on TypeScript merge precedence so `a` is always the weaker merge candidate
  // ensures that asymmetric merges like `type + var` are correctly handled
  if (kindRank[a] > kindRank[b]) {
    [a, b] = [b, a];
  }

  switch (a) {
    case 'interface':
      return b === 'class' || b === 'interface';
    case 'namespace':
      return (
        b === 'class' || b === 'enum' || b === 'function' || b === 'namespace'
      );
    case 'type':
      // type can only merge with value-only declarations
      return b === 'function' || b === 'var';
    default:
      return false;
  }
}
