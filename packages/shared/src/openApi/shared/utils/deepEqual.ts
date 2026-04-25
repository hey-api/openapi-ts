/**
 * Deep equality for JSON-compatible values (objects, arrays, primitives).
 * Used to determine whether read/write pruned variants actually differ.
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  const ctor = (a as object).constructor;
  if (ctor !== (b as object).constructor) return false;

  // Arrays
  if (Array.isArray(a)) {
    const arrA = a as unknown[];
    const arrB = b as unknown[];
    let len = arrA.length;
    if (len !== arrB.length) return false;
    while (len--) {
      if (!deepEqual(arrA[len], arrB[len])) return false;
    }
    return true;
  }

  // Plain objects
  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  let len = 0;
  for (const key in objA) {
    if (Object.hasOwn(objA, key)) {
      ++len;
      if (!Object.hasOwn(objB, key)) return false;
      if (!deepEqual(objA[key], objB[key])) return false;
    }
  }
  return Object.keys(objB).length === len;
};

export default deepEqual;
