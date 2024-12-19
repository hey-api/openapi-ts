import { compiler, type Property, type TypeNode } from '../compiler';
import type { Model } from '../openApi';
import { sanitizeOperationParameterName } from '../openApi';
import type { Client } from '../types/client';
import { getConfig, isLegacyClient } from './config';
import { refSchemasPartial } from './const';
import { enumValue } from './enum';
import { escapeComment, escapeName, unescapeName } from './escape';
import { getSchemasMeta } from './meta';
import { reservedJavaScriptKeywordsRegExp } from './regexp';
import { stringCase } from './stringCase';
import { unique } from './unique';

export const isModelDate = (model: Model): boolean =>
  model.format === 'date' || model.format === 'date-time';

const base = (model: Model) => {
  const config = getConfig();

  if (model.base === 'binary') {
    return compiler.typeUnionNode({
      types: ['Blob', 'File'],
    });
  }

  if (config.plugins['@hey-api/transformers']?.dates && isModelDate(model)) {
    return compiler.typeNode('Date');
  }

  return compiler.typeNode(model.base);
};

const typeReference = (model: Model) => {
  // nullable is false when base is null to avoid duplicate null statements
  const isNullable = model.base === 'null' ? false : model.isNullable;
  let typeNode = base(model);
  /**
   * special handling for single reference. The current approach didn't handle
   * transformed names, this fixes that. We should add a more robust solution,
   * but this will work for now.
   * {@link https://github.com/hey-api/openapi-ts/issues/768}
   */
  if (model.export === 'reference' && model.$refs.length === 1) {
    if (model.$refs[0]!.startsWith(refSchemasPartial)) {
      const meta = getSchemasMeta(model.base);
      typeNode = compiler.typeNode(meta.name);
    }
  }
  const unionNode = compiler.typeUnionNode({
    isNullable,
    types: [typeNode],
  });
  return unionNode;
};

const typeArray = (model: Model) => {
  if (model.link) {
    // We treat an array of `model.link` as constant size array definition.
    if (Array.isArray(model.link)) {
      const types = model.link.map((m) => toType(m));
      const tuple = compiler.typeTupleNode({
        isNullable: model.isNullable,
        types,
      });
      return tuple;
    }

    // Special case where we use tuple to define constant size array.
    if (
      model.export === 'array' &&
      model.maxItems &&
      model.minItems &&
      model.maxItems === model.minItems &&
      model.maxItems <= 100
    ) {
      const types = Array(model.maxItems).fill(toType(model.link));
      const tuple = compiler.typeTupleNode({
        isNullable: model.isNullable,
        types,
      });
      return tuple;
    }

    return compiler.typeArrayNode([toType(model.link)], model.isNullable);
  }

  return compiler.typeArrayNode([base(model)], model.isNullable);
};

const typeEnum = (model: Model) => {
  const values = model.enum.map((enumerator) => enumValue(enumerator.value));
  return compiler.typeUnionNode({
    isNullable: model.isNullable,
    types: values,
  });
};

const typeDict = (model: Model) => {
  const type =
    model.link && !Array.isArray(model.link) ? toType(model.link) : base(model);
  return compiler.typeRecordNode(['string'], [type], model.isNullable, true);
};

const typeUnionOrIntersection = ({
  model,
  style,
}: {
  model: Model;
  style: 'intersection' | 'union';
}) => {
  const types = model.properties
    .map((model) => {
      const str = compiler.nodeToString({
        node: toType(model),
        unescape: true,
      });
      return str;
    })
    .filter(unique);

  const node =
    style === 'union'
      ? compiler.typeUnionNode({
          // avoid printing duplicate null statements
          isNullable:
            model.isNullable &&
            !model.properties.find((property) => property.isNullable),
          types,
        })
      : compiler.typeIntersectionNode({
          isNullable: model.isNullable,
          types,
        });

  // top-level models don't need parentheses around them
  if (model.meta) {
    return node;
  }

  return compiler.typeParenthesizedNode({
    type: node,
  });
};

const typeInterface = (model: Model) => {
  if (!model.properties.length) {
    return compiler.typeNode('unknown');
  }

  const config = getConfig();

  const isLegacy = isLegacyClient(config);

  const properties: Property[] = model.properties.map((property) => {
    let maybeRequired = property.isRequired ? '' : '?';
    let value = toType(property);
    let name = !isLegacy
      ? escapeName(unescapeName(transformTypeKeyName(property.name)))
      : // special test for 1XX status codes. We need a more robust system
        // for escaping values depending on context in which they're printed,
        // but since this works for client packages, it's not worth it right now
        /^\dXX$/.test(property.name)
        ? escapeName(property.name)
        : property.name;
    // special case for additional properties type
    if (property.name === '[key: string]') {
      name = property.name;
      if (maybeRequired) {
        maybeRequired = '';
        value = compiler.typeUnionNode({
          types: [value, 'undefined'],
        });
      }
    }
    return {
      comment: [
        property.description && escapeComment(property.description),
        property.deprecated && '@deprecated',
      ],
      isReadOnly: property.isReadOnly,
      isRequired: maybeRequired === '',
      name,
      type: value,
    };
  });

  return compiler.typeInterfaceNode({
    isNullable: model.isNullable,
    properties,
    useLegacyResolution: true,
  });
};

export const toType = (model: Model): TypeNode => {
  switch (model.export) {
    case 'all-of':
      return typeUnionOrIntersection({
        model,
        style: 'intersection',
      });
    case 'any-of':
    case 'one-of':
      return typeUnionOrIntersection({
        model,
        style: 'union',
      });
    case 'array':
      return typeArray(model);
    case 'dictionary':
      return typeDict(model);
    case 'enum':
      return typeEnum(model);
    case 'interface':
      return typeInterface(model);
    case 'const':
    case 'generic':
    case 'reference':
    default:
      return typeReference(model);
  }
};

export interface SetUniqueTypeNameResult {
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
 * @returns {SetUniqueTypeNameResult}
 */
export const setUniqueTypeName = ({
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
}): SetUniqueTypeNameResult => {
  let result: SetUniqueTypeNameResult = {
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
    result = setUniqueTypeName({
      client,
      count: count + 1,
      create,
      meta,
      nameTransformer,
    });
  }
  return result;
};

export interface UnsetUniqueTypeNameResult {
  /**
   * Did this function delete a property from the `client.types` object?
   */
  deleted: boolean;
  /**
   * Unique name removed from the `client.types` object.
   */
  name: string;
}

export const unsetUniqueTypeName = ({
  client,
  name,
}: {
  client: Client;
  name: string;
}): UnsetUniqueTypeNameResult => {
  let result: UnsetUniqueTypeNameResult = {
    deleted: false,
    name: '',
  };
  if (!client.types[name]) {
    return result;
  }
  delete client.types[name];
  result = {
    deleted: true,
    name,
  };
  return result;
};

/**
 * Replaces any invalid characters from a parameter name.
 * For example: 'filter.someProperty' becomes 'filterSomeProperty'.
 */
export const transformTypeKeyName = (value: string): string => {
  const config = getConfig();

  // transform only for legacy clients
  if (!isLegacyClient(config)) {
    return value;
  }

  const name = stringCase({
    case: 'camelCase',
    value: sanitizeOperationParameterName(value),
  }).replace(reservedJavaScriptKeywordsRegExp, '_$1');
  return name;
};
