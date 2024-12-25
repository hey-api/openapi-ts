export const irRef = '#/ir/';

export const isRefOpenApiComponent = ($ref: string): boolean => {
  const parts = refToParts($ref);
  // reusable components are nested within components/<namespace>/<name>
  return parts.length === 3 && parts[0] === 'components';
};

/**
 * Returns the reusable component name from `$ref`.
 */
export const refToName = ($ref: string): string => {
  const parts = refToParts($ref);
  const name = parts[parts.length - 1]!;
  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  return decodeURI(name);
};

const refToParts = ($ref: string): string[] => {
  // Remove the leading `#` and split by `/` to traverse the object
  const parts = $ref.replace(/^#\//, '').split('/');
  return parts;
};

export const resolveRef = <T>({
  $ref,
  spec,
}: {
  $ref: string;
  spec: Record<string, any>;
}): T => {
  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  const parts = refToParts(decodeURI($ref));

  let current = spec;

  for (const part of parts) {
    const p = part as keyof typeof current;
    if (current[p] === undefined) {
      throw new Error(`Reference not found: ${$ref}`);
    }
    current = current[p];
  }

  return current as T;
};
