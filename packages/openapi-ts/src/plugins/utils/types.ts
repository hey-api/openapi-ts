import ts from 'typescript';

import type { Property } from '../../compiler';
import { compiler } from '../../compiler';
import type { TypeScriptFile } from '../../generate/files';
import type { IRSchemaObject } from '../../ir/ir';
import { deduplicateSchema } from '../../ir/schema';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../openApi';
import { escapeComment } from '../../utils/escape';
import { irRef, isRefOpenApiComponent } from '../../utils/ref';

export type SchemaToTypeOptions = {
  enums?: 'javascript' | 'typescript' | 'typescript+namespace' | false;
  file: TypeScriptFile;
  useTransformersDate?: boolean;
};

interface SchemaWithType<T extends Required<IRSchemaObject>['type']>
  extends Omit<IRSchemaObject, 'type'> {
  type: Extract<Required<IRSchemaObject>['type'], T>;
}

const parseSchemaJsDoc = ({ schema }: { schema: IRSchemaObject }) => {
  const comments = [
    schema.description && escapeComment(schema.description),
    schema.deprecated && '@deprecated',
  ];
  return comments;
};

const addJavaScriptEnum = ({
  $ref,
  schema,
  options,
}: {
  $ref: string;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = options.file.identifier({
    $ref,
    create: true,
    namespace: 'value',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (!identifier.created) {
    return;
  }

  const enumObject = schemaToEnumObject({ schema });

  const expression = compiler.objectExpression({
    multiLine: true,
    obj: enumObject.obj,
  });
  const node = compiler.constVariable({
    assertion: 'const',
    comment: parseSchemaJsDoc({ schema }),
    exportConst: true,
    expression,
    name: identifier.name || '',
  });
  return node;
};

const schemaToEnumObject = ({ schema }: { schema: IRSchemaObject }) => {
  const typeofItems: Array<
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
  > = [];

  const obj = (schema.items ?? []).map((item) => {
    const typeOfItemConst = typeof item.const;

    if (!typeofItems.includes(typeOfItemConst)) {
      typeofItems.push(typeOfItemConst);
    }

    let key;
    if (item.title) {
      key = item.title;
    } else if (typeOfItemConst === 'number') {
      key = `_${item.const}`;
    } else if (typeOfItemConst === 'boolean') {
      const valid = typeOfItemConst ? 'true' : 'false';
      key = valid.toLocaleUpperCase();
    } else {
      let valid = ensureValidTypeScriptJavaScriptIdentifier(
        item.const as string,
      );
      if (!valid) {
        // TODO: parser - abstract empty string handling
        valid = 'empty_string';
      }
      key = valid.toLocaleUpperCase();
    }
    return {
      comments: parseSchemaJsDoc({ schema: item }),
      key,
      value: item.const,
    };
  });

  return {
    obj,
    typeofItems,
  };
};

const addTypeEnum = ({
  $ref,
  schema,
  options,
}: {
  $ref: string;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = options.file.identifier({
    $ref,
    create: true,
    namespace: 'type',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (
    !identifier.created &&
    !isRefOpenApiComponent($ref) &&
    options.enums !== 'typescript+namespace'
  ) {
    return;
  }

  const node = compiler.typeAliasDeclaration({
    comment: parseSchemaJsDoc({ schema }),
    exportType: true,
    name: identifier.name || '',
    type: schemaToType({
      options,
      schema: {
        ...schema,
        type: undefined,
      },
    }),
  });
  return node;
};

const addTypeScriptEnum = ({
  $ref,
  schema,
  options,
}: {
  $ref: string;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = options.file.identifier({
    $ref,
    create: true,
    namespace: 'value',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (!identifier.created && options.enums !== 'typescript+namespace') {
    return;
  }

  const enumObject = schemaToEnumObject({ schema });

  // TypeScript enums support only string and number values so we need to fallback to types
  if (
    enumObject.typeofItems.filter(
      (type) => type !== 'number' && type !== 'string',
    ).length
  ) {
    const node = addTypeEnum({
      $ref,
      options,
      schema,
    });
    return node;
  }

  const node = compiler.enumDeclaration({
    leadingComment: parseSchemaJsDoc({ schema }),
    name: identifier.name || '',
    obj: enumObject.obj,
  });
  return node;
};

const arrayTypeToIdentifier = ({
  namespace,
  schema,
  options,
}: {
  namespace: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'array'>;
}) => {
  if (!schema.items) {
    return compiler.typeArrayNode(
      compiler.keywordTypeNode({
        keyword: 'unknown',
      }),
    );
  }

  schema = deduplicateSchema({ schema });

  // at least one item is guaranteed
  const itemTypes = schema.items!.map((item) =>
    schemaToType({
      namespace,
      options,
      schema: item,
    }),
  );

  if (itemTypes.length === 1) {
    return compiler.typeArrayNode(itemTypes[0]);
  }

  if (schema.logicalOperator === 'and') {
    return compiler.typeArrayNode(
      compiler.typeIntersectionNode({ types: itemTypes }),
    );
  }

  return compiler.typeArrayNode(compiler.typeUnionNode({ types: itemTypes }));
};

const booleanTypeToIdentifier = ({
  schema,
}: {
  schema: SchemaWithType<'boolean'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.boolean(schema.const as boolean),
    });
  }

  return compiler.keywordTypeNode({
    keyword: 'boolean',
  });
};

const enumTypeToIdentifier = ({
  $ref,
  namespace,
  schema,
  options,
}: {
  $ref?: string;
  namespace: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'enum'>;
}): ts.TypeNode => {
  // TODO: parser - add option to inline enums
  if ($ref) {
    const isRefComponent = isRefOpenApiComponent($ref);

    // when enums are disabled (default), emit only reusable components
    // as types, otherwise the output would be broken if we skipped all enums
    if (!options.enums && isRefComponent) {
      const typeNode = addTypeEnum({
        $ref,
        options,
        schema,
      });
      if (typeNode) {
        options.file.add(typeNode);
      }
    }

    if (options.enums === 'javascript') {
      const typeNode = addTypeEnum({
        $ref,
        options,
        schema,
      });
      if (typeNode) {
        options.file.add(typeNode);
      }

      const objectNode = addJavaScriptEnum({
        $ref,
        options,
        schema,
      });
      if (objectNode) {
        options.file.add(objectNode);
      }
    }

    if (options.enums === 'typescript') {
      const enumNode = addTypeScriptEnum({
        $ref,
        options,
        schema,
      });
      if (enumNode) {
        options.file.add(enumNode);
      }
    }

    if (options.enums === 'typescript+namespace') {
      const enumNode = addTypeScriptEnum({
        $ref,
        options,
        schema,
      });
      if (enumNode) {
        if (isRefComponent) {
          options.file.add(enumNode);
        } else {
          // emit enum inside TypeScript namespace
          namespace.push(enumNode);
        }
      }
    }
  }

  const type = schemaToType({
    options,
    schema: {
      ...schema,
      type: undefined,
    },
  });
  return type;
};

const numberTypeToIdentifier = ({
  schema,
}: {
  schema: SchemaWithType<'number'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.ots.number(schema.const as number),
    });
  }

  return compiler.keywordTypeNode({
    keyword: 'number',
  });
};

const digitsRegExp = /^\d+$/;

const objectTypeToIdentifier = ({
  namespace,
  schema,
  options,
}: {
  namespace: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'object'>;
}) => {
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  let indexPropertyItems: Array<IRSchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name];
    const isRequired = required.includes(name);
    digitsRegExp.lastIndex = 0;
    schemaProperties.push({
      comment: parseSchemaJsDoc({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name: digitsRegExp.test(name)
        ? ts.factory.createNumericLiteral(name)
        : name,
      type: schemaToType({
        $ref: `${irRef}${name}`,
        namespace,
        options,
        schema: property,
      }),
    });
    indexPropertyItems.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  if (
    schema.additionalProperties &&
    (schema.additionalProperties.type !== 'never' || !indexPropertyItems.length)
  ) {
    if (schema.additionalProperties.type === 'never') {
      indexPropertyItems = [schema.additionalProperties];
    } else {
      indexPropertyItems.unshift(schema.additionalProperties);
    }

    if (hasOptionalProperties) {
      indexPropertyItems.push({
        type: 'undefined',
      });
    }

    indexProperty = {
      isRequired: true,
      name: 'key',
      type: schemaToType({
        namespace,
        options,
        schema:
          indexPropertyItems.length === 1
            ? indexPropertyItems[0]
            : {
                items: indexPropertyItems,
                logicalOperator: 'or',
              },
      }),
    };
  }

  return compiler.typeInterfaceNode({
    indexProperty,
    properties: schemaProperties,
    useLegacyResolution: false,
  });
};

const stringTypeToIdentifier = ({
  schema,
  options,
}: {
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'string'>;
}) => {
  if (schema.const !== undefined) {
    return compiler.literalTypeNode({
      literal: compiler.stringLiteral({ text: schema.const as string }),
    });
  }

  if (schema.format) {
    if (schema.format === 'binary') {
      return compiler.typeUnionNode({
        types: [
          compiler.typeReferenceNode({
            typeName: 'Blob',
          }),
          compiler.typeReferenceNode({
            typeName: 'File',
          }),
        ],
      });
    }

    if (schema.format === 'date-time' || schema.format === 'date') {
      // TODO: parser - add ability to skip type transformers
      if (options.useTransformersDate) {
        return compiler.typeReferenceNode({ typeName: 'Date' });
      }
    }
  }

  return compiler.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  namespace,
  schema,
  options,
}: {
  namespace: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: SchemaWithType<'tuple'>;
}) => {
  const itemTypes: Array<ts.TypeNode> = [];

  for (const item of schema.items ?? []) {
    itemTypes.push(
      schemaToType({
        namespace,
        options,
        schema: item,
      }),
    );
  }

  return compiler.typeTupleNode({
    types: itemTypes,
  });
};

const schemaTypeToIdentifier = ({
  $ref,
  namespace,
  schema,
  options,
}: {
  $ref?: string;
  namespace: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  switch (schema.type as Required<IRSchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        namespace,
        options,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        $ref,
        namespace,
        options,
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'never':
      return compiler.keywordTypeNode({ keyword: 'never' });
    case 'null':
      return compiler.literalTypeNode({
        literal: compiler.null(),
      });
    case 'number':
      return numberTypeToIdentifier({
        schema: schema as SchemaWithType<'number'>,
      });
    case 'object':
      return objectTypeToIdentifier({
        namespace,
        options,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToIdentifier({
        options,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        namespace,
        options,
        schema: schema as SchemaWithType<'tuple'>,
      });
    case 'undefined':
      return compiler.keywordTypeNode({ keyword: 'undefined' });
    case 'unknown':
      return compiler.keywordTypeNode({
        keyword: 'unknown',
      });
    case 'void':
      return compiler.keywordTypeNode({
        keyword: 'void',
      });
  }
};

export const schemaToType = ({
  $ref,
  namespace = [],
  schema,
  options,
}: {
  $ref?: string;
  namespace?: Array<ts.Statement>;
  options: SchemaToTypeOptions;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  let type: ts.TypeNode | undefined;

  if (schema.$ref) {
    const identifier = options.file.identifier({
      $ref: schema.$ref,
      create: true,
      namespace: 'type',
    });
    type = compiler.typeReferenceNode({
      typeName: identifier.name || '',
    });
  } else if (schema.type) {
    type = schemaTypeToIdentifier({
      $ref,
      namespace,
      options,
      schema,
    });
  } else if (schema.items) {
    schema = deduplicateSchema({ schema });
    if (schema.items) {
      const itemTypes = schema.items.map((item) =>
        schemaToType({
          namespace,
          options,
          schema: item,
        }),
      );
      type =
        schema.logicalOperator === 'and'
          ? compiler.typeIntersectionNode({ types: itemTypes })
          : compiler.typeUnionNode({ types: itemTypes });
    } else {
      type = schemaToType({
        namespace,
        options,
        schema,
      });
    }
  } else {
    // catch-all fallback for failed schemas
    type = schemaTypeToIdentifier({
      namespace,
      options,
      schema: {
        type: 'unknown',
      },
    });
  }

  // emit nodes only if $ref points to a reusable component
  if ($ref && isRefOpenApiComponent($ref)) {
    // emit namespace if it has any members
    if (namespace.length) {
      const identifier = options.file.identifier({
        $ref,
        create: true,
        namespace: 'value',
      });
      const node = compiler.namespaceDeclaration({
        name: identifier.name || '',
        statements: namespace,
      });
      options.file.add(node);
    }

    // enum handler emits its own artifacts
    if (schema.type !== 'enum') {
      const identifier = options.file.identifier({
        $ref,
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        comment: parseSchemaJsDoc({ schema }),
        exportType: true,
        name: identifier.name || '',
        type,
      });
      options.file.add(node);
    }
  }

  return type;
};
