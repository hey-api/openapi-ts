const jsonPointerSlash = /~1/g;
const jsonPointerTilde = /~0/g;

export const irRef = '#/ir/';

export const isRefOpenApiComponent = ($ref: string): boolean => {
  const path = refToPath($ref);
  // reusable components are nested within components/<namespace>/<name>
  return path.length === 3 && path[0] === 'components';
};

/**
 * Returns the reusable component name from `$ref`.
 */
export const refToName = ($ref: string): string => {
  const path = refToPath($ref);
  const name = path[path.length - 1]!;
  // refs using unicode characters become encoded, didn't investigate why
  // but the suspicion is this comes from `@hey-api/json-schema-ref-parser`
  return decodeURI(name);
};

export const pathToRef = (path: ReadonlyArray<string | number>): string => {
  const encodedPath = path.map((part) =>
    String(part).replace(/~/g, '~0').replace(/\//g, '~1'),
  );
  return `#/${encodedPath.join('/')}`;
};

export const refToPath = ($ref: string): string[] => {
  const path = $ref.replace(/^#\//, '').split('/');
  const cleanPath = path.map((part) =>
    part.replace(jsonPointerSlash, '/').replace(jsonPointerTilde, '~'),
  );
  return cleanPath;
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
  const path = refToPath(decodeURI($ref));

  let current = spec;

  for (const part of path) {
    const p = part as keyof typeof current;
    if (current[p] === undefined) {
      throw new Error(`Reference not found: ${$ref}`);
    }
    current = current[p];
  }

  return current as T;
};
