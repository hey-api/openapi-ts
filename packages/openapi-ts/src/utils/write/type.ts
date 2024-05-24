import { compiler, type Property, type TypeNode } from '../../compiler';
import type { Model } from '../../openApi';
import { transformTypeKeyName } from '../../openApi/common/parser/type';
import type { Client } from '../../types/client';
import { getConfig, isStandaloneClient } from '../config';
import { enumValue } from '../enum';
import { escapeComment, escapeName, unescapeName } from '../escape';
import { unique } from '../unique';

const base = (model: Model) => {
  const config = getConfig();

  if (model.base === 'binary') {
    return compiler.typedef.union(['Blob', 'File']);
  }

  if (config.types.dates && model.format === 'date-time') {
    return compiler.typedef.basic('Date');
  }

  return compiler.typedef.basic(model.base);
};

const typeReference = (model: Model) => {
  // nullable is false when base is null to avoid duplicate null statements
  const isNullable = model.base === 'null' ? false : model.isNullable;
  const unionNode = compiler.typedef.union([base(model)], isNullable);
  return unionNode;
};

const typeArray = (model: Model) => {
  // Special case where we use tuple to define constant size array.
  if (
    model.export === 'array' &&
    model.link &&
    model.maxItems &&
    model.minItems &&
    model.maxItems === model.minItems &&
    model.maxItems <= 100
  ) {
    const types = Array(model.maxItems).fill(toType(model.link));
    const tuple = compiler.typedef.tuple({
      isNullable: model.isNullable,
      types,
    });
    return tuple;
  }

  if (model.link) {
    return compiler.typedef.array([toType(model.link)], model.isNullable);
  }

  return compiler.typedef.array([base(model)], model.isNullable);
};

const typeEnum = (model: Model) => {
  const values = model.enum.map((enumerator) => enumValue(enumerator.value));
  return compiler.typedef.union(values, model.isNullable);
};

const typeDict = (model: Model) => {
  const type = model.link ? toType(model.link) : base(model);
  return compiler.typedef.record(['string'], [type], model.isNullable);
};

const typeUnion = (model: Model) => {
  const models = model.properties;
  const types = models
    .map((model) =>
      compiler.utils.toString({ node: toType(model), unescape: true }),
    )
    .filter(unique);
  return compiler.typedef.union(types, model.isNullable);
};

const typeIntersect = (model: Model) => {
  const types = model.properties
    .map((m) => compiler.utils.toString({ node: toType(m), unescape: true }))
    .filter(unique);
  return compiler.typedef.intersect(types, model.isNullable);
};

const typeInterface = (model: Model) => {
  if (!model.properties.length) {
    return compiler.typedef.basic('unknown');
  }

  const config = getConfig();

  const isStandalone = isStandaloneClient(config);

  const properties: Property[] = model.properties.map((property) => {
    let maybeRequired = property.isRequired ? '' : '?';
    let value = toType(property);
    // special case for additional properties type
    if (property.name === '[key: string]' && maybeRequired) {
      maybeRequired = '';
      value = compiler.typedef.union([value, 'undefined']);
    }
    return {
      comment: [
        property.description && escapeComment(property.description),
        property.deprecated && '@deprecated',
      ],
      isReadOnly: property.isReadOnly,
      isRequired: maybeRequired === '',
      name: isStandalone
        ? escapeName(unescapeName(transformTypeKeyName(property.name)))
        : property.name,
      type: value,
    };
  });

  return compiler.typedef.interface(properties, model.isNullable);
};

export const toType = (model: Model): TypeNode => {
  switch (model.export) {
    case 'all-of':
      return typeIntersect(model);
    case 'any-of':
    case 'one-of':
      return typeUnion(model);
    case 'array':
      return typeArray(model);
    case 'dictionary':
      return typeDict(model);
    case 'enum':
      return typeEnum(model);
    case 'interface':
      return typeInterface(model);
    case 'reference':
    default:
      return typeReference(model);
  }
};

interface UniqueTypeNameResult {
  /**
   * Did this function add a new property to the `client.types` object?
   */
  created: boolean;
  /**
   * Unique name for the exported type.
   */
  name: string;
}

/**
 * Generates a unique name for the exported type for given model meta.
 * @param args.client Internal client instance
 * @param args.count Unique key for deduplication
 * @param args.create If a name record does not exist, should it be created?
 * @param args.meta Meta property from the model
 * @param args.nameTransformer Function for transforming name into the final
 * value. In different contexts, a different strategy might be used. For
 * example, slashes `/` are invalid in TypeScript identifiers, but okay in
 * a JavaScript object key name.
 * @returns {UniqueTypeNameResult}
 */
export const uniqueTypeName = ({
  client,
  count = 1,
  create = false,
  meta,
  nameTransformer,
}: Pick<Required<Model>, 'meta'> & {
  client: Client;
  count?: number;
  create?: boolean;
  nameTransformer?: (value: string) => string;
}): UniqueTypeNameResult => {
  let result: UniqueTypeNameResult = {
    created: false,
    name: '',
  };
  let name = meta.name;
  if (nameTransformer) {
    name = nameTransformer(name);
  }
  if (count > 1) {
    name = `${name}${count}`;
  }
  const type = client.types[name];
  if (!type) {
    if (create) {
      client.types[name] = meta;
      result = {
        created: true,
        name,
      };
    }
  } else if (type.$ref === meta.$ref) {
    result = {
      created: false,
      name,
    };
  } else {
    result = uniqueTypeName({
      client,
      count: count + 1,
      create,
      meta,
      nameTransformer,
    });
  }
  return result;
};
