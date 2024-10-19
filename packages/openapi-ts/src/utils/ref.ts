export const irRef = '#/ir/';

export const isRefOpenApiComponent = ($ref: string): boolean => {
  const parts = refToParts($ref);
  // reusable components are nested within components/<namespace>/<name>
  return parts.length === 3 && parts[0] === 'components';
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
  const parts = refToParts($ref);

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
