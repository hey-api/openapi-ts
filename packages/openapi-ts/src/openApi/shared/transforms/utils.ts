type Obj =
  | Record<string, unknown>
  | Set<string>
  | ReadonlyArray<string | undefined>;

const hasName = (obj: Obj, value: string): boolean => {
  if (obj instanceof Set) {
    return obj.has(value);
  }
  if (obj instanceof Array) {
    return obj.includes(value);
  }
  return value in obj;
};

export const getUniqueComponentName = ({
  base,
  components,
  extraComponents,
}: {
  base: string;
  /**
   * Input components.
   */
  components: Obj;
  /**
   * Temporary input components, waiting to be inserted for example.
   */
  extraComponents?: Obj;
}): string => {
  let index = 2;
  // Strip trailing digits only if the last character before the digits is a Unicode letter.
  // For example: "foo2" becomes "foo", but "foo_2" stays "foo_2"
  // const match = _base.match(/(.+\p{L})(\d+)$/u);
  // const base = match && false ? _base.replace(/\d+$/, '') : _base;
  let name = base;
  while (
    hasName(components, name) ||
    (extraComponents && hasName(extraComponents, name))
  ) {
    name = `${base}${index}`;
    index += 1;
  }
  return name;
};

export const isPathRootSchema = (path: ReadonlyArray<string | number>) =>
  (path.length === 3 && path[0] === 'components' && path[1] === 'schemas') ||
  (path.length === 2 && path[0] === 'definitions');

export const specToSchemasPointerNamespace = (spec: unknown): string => {
  if (spec && typeof spec === 'object') {
    if ('swagger' in spec) {
      // #/definitions/SchemaName
      return '#/definitions/';
    }

    if ('openapi' in spec) {
      // #/components/schemas/SchemaName
      return '#/components/schemas/';
    }
  }

  return '';
};
