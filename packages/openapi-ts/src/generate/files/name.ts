import type { EnsureUniqueIdentifierResult, Namespace } from './types';

export const ensureUniqueIdentifier = ({
  $ref,
  count = 1,
  create = false,
  namespace,
  validNameTransformer,
}: {
  $ref: string;
  count?: number;
  create?: boolean;
  namespace: Namespace;
  validNameTransformer?: (value: string) => string;
}): EnsureUniqueIdentifierResult => {
  const parts = $ref.split('/');
  let name = parts[parts.length - 1] || '';

  if (!name) {
    return {
      created: false,
      name: '',
    };
  }

  const refValue = namespace[$ref];
  if (refValue) {
    return {
      created: false,
      name: refValue.name,
    };
  }

  if (count > 1) {
    name = `${name}${count}`;
  }

  let nameValue = namespace[name];
  if (nameValue) {
    if (nameValue.$ref === $ref) {
      return {
        created: false,
        name: nameValue.name,
      };
    }

    return ensureUniqueIdentifier({
      $ref,
      count: count + 1,
      create,
      namespace,
      validNameTransformer,
    });
  }

  if (!create) {
    return {
      created: false,
      name: '',
    };
  }

  nameValue = {
    $ref,
    name: validNameTransformer ? validNameTransformer(name) : name,
  };
  namespace[name] = nameValue;
  namespace[nameValue.$ref] = nameValue;

  return {
    created: true,
    name: nameValue.name,
  };
};

export const splitNameAndExtension = (fileName: string) => {
  const match = fileName.match(/\.[0-9a-z]+$/i);
  const extension = match ? match[0].slice(1) : '';
  const name = fileName.slice(
    0,
    fileName.length - (extension ? extension.length + 1 : 0),
  );
  return { extension, name };
};
