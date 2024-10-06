import type { ModelMeta } from '../../openApi';
import type { EnsureUniqueIdentifierResult, Namespace } from './types';

export const ensureUniqueIdentifier = ({
  count = 1,
  create = false,
  meta,
  nameTransformer,
  namespace,
}: {
  count?: number;
  create?: boolean;
  meta?: ModelMeta;
  nameTransformer?: (value: string) => string;
  namespace: Namespace;
}): EnsureUniqueIdentifierResult => {
  if (!meta) {
    return {
      created: false,
      name: '',
    };
  }

  const refValue = namespace[meta.$ref];
  if (refValue) {
    return {
      created: false,
      name: refValue.name,
    };
  }

  let name = meta.name;
  if (nameTransformer) {
    name = nameTransformer(name);
  }
  if (count > 1) {
    name = `${name}${count}`;
  }

  const nameValue = namespace[name];
  if (!nameValue) {
    if (create) {
      namespace[name] = meta;
      namespace[meta.$ref] = meta;

      return {
        created: true,
        name,
      };
    }
  } else if (nameValue.$ref === meta.$ref) {
    return {
      created: false,
      name,
    };
  } else {
    return ensureUniqueIdentifier({
      count: count + 1,
      create,
      meta,
      nameTransformer,
      namespace,
    });
  }

  return {
    created: false,
    name: '',
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
