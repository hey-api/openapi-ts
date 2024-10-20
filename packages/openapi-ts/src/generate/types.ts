import type { EnumDeclaration } from 'typescript';
import type ts from 'typescript';

import type { Property } from '../compiler';
import { type Comments, compiler, type Node } from '../compiler';
import type { IRContext } from '../ir/context';
import type {
  IROperationObject,
  IRParameterObject,
  IRPathsObject,
  IRResponseObject,
  IRSchemaObject,
} from '../ir/ir';
import { addItemsToSchema } from '../ir/utils';
import {
  ensureValidTypeScriptJavaScriptIdentifier,
  isOperationParameterRequired,
} from '../openApi';
import type {
  Client,
  Method,
  Model,
  OperationParameter,
} from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isLegacyClient } from '../utils/config';
import { enumEntry, enumUnionType } from '../utils/enum';
import { escapeComment } from '../utils/escape';
import { isRefOpenApiComponent } from '../utils/ref';
import { sortByName, sorterByName } from '../utils/sort';
import {
  setUniqueTypeName,
  type SetUniqueTypeNameResult,
  toType,
} from '../utils/type';
import { TypeScriptFile } from './files';
import {
  operationDataRef,
  operationDataTypeName,
  operationErrorRef,
  operationErrorTypeName,
  operationResponseRef,
  operationResponseTypeName,
} from './services';

export interface TypesProps {
  client: Client;
  model: Model;
  onNode: (node: Node) => void;
  onRemoveNode?: VoidFunction;
}

interface SchemaWithType<T extends Required<IRSchemaObject>['type']>
  extends Omit<IRSchemaObject, 'type'> {
  type: Extract<Required<IRSchemaObject>['type'], T>;
}

const treeName = '$OpenApiTs';

export const irRef = '#/ir/';
const typesId = 'types';

export const emptyModel: Model = {
  $refs: [],
  base: '',
  description: null,
  enum: [],
  enums: [],
  export: 'interface',
  imports: [],
  in: '',
  isDefinition: false,
  isNullable: false,
  isReadOnly: false,
  isRequired: false,
  link: null,
  name: '',
  properties: [],
  template: null,
  type: '',
};

const generateEnum = ({
  leadingComment,
  comments,
  meta,
  obj,
  onNode,
  ...setUniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.enumDeclaration>[0], 'name'> &
  Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> &
  Pick<TypesProps, 'onNode'>) => {
  // generate types only for top-level models
  if (!meta) {
    return;
  }

  const { created, name } = setUniqueTypeName({
    create: true,
    meta,
    ...setUniqueTypeNameArgs,
  });
  if (created) {
    const node = compiler.enumDeclaration({
      comments,
      leadingComment,
      name,
      obj,
    });
    onNode(node);
  }
};

export const generateType = ({
  comment,
  meta,
  onCreated,
  onNode,
  type,
  ...setUniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.typeAliasDeclaration>[0], 'name'> &
  Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> &
  Pick<TypesProps, 'onNode'> & {
    onCreated?: (name: string) => void;
  }): SetUniqueTypeNameResult => {
  // generate types only for top-level models
  if (!meta) {
    return {
      created: false,
      name: '',
    };
  }

  const result = setUniqueTypeName({
    create: true,
    meta,
    ...setUniqueTypeNameArgs,
  });
  const { created, name } = result;
  if (created) {
    const node = compiler.typeAliasDeclaration({
      comment,
      exportType: true,
      name,
      type,
    });
    onNode(node);

    onCreated?.(name);
  }
  return result;
};

const processComposition = (props: TypesProps) => {
  const config = getConfig();

  const enumDeclarations = [] as EnumDeclaration[];

  processType(props);

  props.model.enums.forEach((enumerator) => {
    if (config.types.enums !== 'typescript+namespace') {
      return processEnum({
        ...props,
        model: enumerator,
      });
    }

    return processScopedEnum({
      ...props,
      model: enumerator,
      onNode: (node) => {
        enumDeclarations.push(node as EnumDeclaration);
      },
    });
  });

  if (enumDeclarations.length) {
    props.onNode(
      compiler.namespaceDeclaration({
        name: props.model.name,
        statements: enumDeclarations,
      }),
    );
  }
};

const processEnum = ({ client, model, onNode }: TypesProps) => {
  const config = getConfig();

  const properties: Record<string | number, unknown> = {};
  const comments: Record<string | number, Comments> = {};
  model.enum.forEach((enumerator) => {
    const { key, value } = enumEntry(enumerator);
    properties[key] = value;
    const comment = enumerator.customDescription || enumerator.description;
    if (comment) {
      comments[key] = [escapeComment(comment)];
    }
  });

  const comment = [
    model.description && escapeComment(model.description),
    model.deprecated && '@deprecated',
  ];

  if (
    config.types.enums === 'typescript' ||
    config.types.enums === 'typescript+namespace'
  ) {
    generateEnum({
      client,
      comments,
      leadingComment: comment,
      meta: model.meta,
      obj: properties,
      onNode,
    });
    return;
  }

  generateType({
    client,
    comment,
    meta: model.meta,
    onCreated: (name) => {
      // create a separate JavaScript object export
      if (config.types.enums === 'javascript') {
        const expression = compiler.objectExpression({
          multiLine: true,
          obj: Object.entries(properties).map(([key, value]) => ({
            comments: comments[key],
            key,
            value,
          })),
          unescape: true,
        });
        const node = compiler.constVariable({
          assertion: 'const',
          comment,
          exportConst: true,
          expression,
          name,
        });
        onNode(node);
      }
    },
    onNode,
    type: enumUnionType(model.enum),
  });
};

const processScopedEnum = ({ model, onNode }: TypesProps) => {
  const properties: Record<string | number, unknown> = {};
  const comments: Record<string | number, Comments> = {};
  model.enum.forEach((enumerator) => {
    const { key, value } = enumEntry(enumerator);
    properties[key] = value;
    const comment = enumerator.customDescription || enumerator.description;
    if (comment) {
      comments[key] = [escapeComment(comment)];
    }
  });
  onNode(
    compiler.enumDeclaration({
      comments,
      leadingComment: [
        model.description && escapeComment(model.description),
        model.deprecated && '@deprecated',
      ],
      name: model.meta?.name || model.name,
      obj: properties,
    }),
  );
};

const processType = ({ client, model, onNode }: TypesProps) => {
  generateType({
    client,
    comment: [
      model.description && escapeComment(model.description),
      model.deprecated && '@deprecated',
    ],
    meta: model.meta,
    onNode,
    type: toType(model),
  });
};

const processModel = (props: TypesProps) => {
  switch (props.model.export) {
    case 'all-of':
    case 'any-of':
    case 'one-of':
    case 'interface':
      return processComposition(props);
    case 'enum':
      return processEnum(props);
    default:
      return processType(props);
  }
};

interface MethodMap {
  $ref?: string;
  req?: OperationParameter[];
  res?: Record<number | string, Model>;
}

type PathMap = {
  [method in Method]?: MethodMap;
};

type PathsMap = Record<string, PathMap>;

const processServiceTypes = ({
  client,
  onNode,
}: Pick<TypesProps, 'client' | 'onNode'>) => {
  const pathsMap: PathsMap = {};

  const config = getConfig();

  if (!config.services.export && !config.types.tree) {
    return;
  }

  const isLegacy = isLegacyClient(config);

  for (const service of client.services) {
    for (const operation of service.operations) {
      if (!operation.parameters.length && !operation.responses.length) {
        continue;
      }

      if (!pathsMap[operation.path]) {
        pathsMap[operation.path] = {};
      }
      const pathMap = pathsMap[operation.path]!;

      if (!pathMap[operation.method]) {
        pathMap[operation.method] = {};
      }
      const methodMap = pathMap[operation.method]!;
      methodMap.$ref = operation.name;

      if (operation.responses.length > 0) {
        if (!methodMap.res) {
          methodMap.res = {};
        }

        if (Array.isArray(methodMap.res)) {
          continue;
        }

        operation.responses.forEach((response) => {
          methodMap.res![response.code] = response;
        });
      }

      if (operation.parameters.length > 0) {
        let bodyParameters: OperationParameter = {
          mediaType: null,
          ...emptyModel,
          in: 'body',
          name: 'body',
          prop: 'body',
        };
        let bodyParameter = operation.parameters.filter(
          (parameter) => parameter.in === 'body',
        );
        if (!bodyParameter.length) {
          bodyParameter = operation.parameters.filter(
            (parameter) => parameter.in === 'formData',
          );
        }

        if (bodyParameter.length === 1) {
          bodyParameters = {
            ...emptyModel,
            ...bodyParameter[0],
            in: 'body',
            isRequired: bodyParameter[0].isRequired,
            name: 'body',
            prop: 'body',
          };
          // assume we have multiple formData parameters from Swagger 2.0
        } else if (bodyParameter.length > 1) {
          bodyParameters = {
            ...emptyModel,
            in: 'body',
            isRequired: bodyParameter.some((parameter) => parameter.isRequired),
            mediaType: 'multipart/form-data',
            name: 'body',
            prop: 'body',
            properties: bodyParameter,
          };
        }

        const headerParameters: OperationParameter = {
          ...emptyModel,
          in: 'header',
          isRequired: isOperationParameterRequired(
            operation.parameters.filter(
              (parameter) => parameter.in === 'header',
            ),
          ),
          mediaType: null,
          name: isLegacy ? 'header' : 'headers',
          prop: isLegacy ? 'header' : 'headers',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'header')
            .sort(sorterByName),
        };
        const pathParameters: OperationParameter = {
          ...emptyModel,
          in: 'path',
          isRequired: isOperationParameterRequired(
            operation.parameters.filter((parameter) => parameter.in === 'path'),
          ),
          mediaType: null,
          name: 'path',
          prop: 'path',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'path')
            .sort(sorterByName),
        };
        const queryParameters: OperationParameter = {
          ...emptyModel,
          in: 'query',
          isRequired: isOperationParameterRequired(
            operation.parameters.filter(
              (parameter) => parameter.in === 'query',
            ),
          ),
          mediaType: null,
          name: 'query',
          prop: 'query',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'query')
            .sort(sorterByName),
        };
        const operationProperties = !isLegacy
          ? [
              bodyParameters,
              headerParameters,
              pathParameters,
              queryParameters,
            ].filter(
              (param) =>
                param.properties.length ||
                param.$refs.length ||
                param.mediaType,
            )
          : sortByName([...operation.parameters]);

        methodMap.req = operationProperties;

        // create type export for operation data
        generateType({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationDataTypeName,
          onNode,
          type: toType({
            ...emptyModel,
            isRequired: true,
            properties: operationProperties,
          }),
        });
      }

      const successResponses = operation.responses.filter((response) =>
        response.responseTypes.includes('success'),
      );

      if (successResponses.length > 0) {
        // create type export for operation response
        generateType({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationResponseTypeName,
          onNode,
          type: toType({
            ...emptyModel,
            export: 'any-of',
            isRequired: true,
            properties: successResponses,
          }),
        });

        const errorResponses = operation.responses.filter((response) =>
          response.responseTypes.includes('error'),
        );

        if (!isLegacy) {
          // create type export for operation error
          generateType({
            client,
            meta: {
              // TODO: this should be exact ref to operation for consistency,
              // but name should work too as operation ID is unique
              $ref: operation.name,
              name: operation.name,
            },
            nameTransformer: operationErrorTypeName,
            onNode,
            type: toType(
              errorResponses.length
                ? {
                    ...emptyModel,
                    export: 'one-of',
                    isRequired: true,
                    properties: errorResponses,
                  }
                : {
                    ...emptyModel,
                    base: 'unknown',
                    isRequired: true,
                    type: 'unknown',
                  },
            ),
          });
        }
      }
    }
  }

  const properties = Object.entries(pathsMap).map(([path, pathMap]) => {
    const pathParameters = Object.entries(pathMap)
      .map(([_method, methodMap]) => {
        const method = _method as Method;

        let methodParameters: Model[] = [];

        if (methodMap.req) {
          const operationName = methodMap.$ref!;
          const { name: base } = setUniqueTypeName({
            client,
            meta: {
              // TODO: this should be exact ref to operation for consistency,
              // but name should work too as operation ID is unique
              $ref: operationName,
              name: operationName,
            },
            nameTransformer: operationDataTypeName,
          });
          const reqKey: Model = {
            ...emptyModel,
            base,
            export: 'reference',
            isRequired: true,
            name: 'req',
            properties: [],
            type: base,
          };
          methodParameters = [...methodParameters, reqKey];
        }

        if (methodMap.res) {
          const reqResParameters = Object.entries(methodMap.res).map(
            ([code, base]) => {
              // TODO: move query params into separate query key
              const value: Model = {
                ...emptyModel,
                ...base,
                isRequired: true,
                name: String(code),
              };
              return value;
            },
          );

          const resKey: Model = {
            ...emptyModel,
            isRequired: true,
            name: 'res',
            properties: reqResParameters,
          };
          methodParameters = [...methodParameters, resKey];
        }

        const methodKey: Model = {
          ...emptyModel,
          isRequired: true,
          name: method.toLocaleLowerCase(),
          properties: methodParameters,
        };
        return methodKey;
      })
      .filter(Boolean);
    const pathKey: Model = {
      ...emptyModel,
      isRequired: true,
      name: `'${path}'`,
      properties: pathParameters as Model[],
    };
    return pathKey;
  });

  if (config.types.tree) {
    generateType({
      client,
      meta: {
        $ref: '@hey-api/openapi-ts',
        name: treeName,
      },
      onNode,
      type: toType({
        ...emptyModel,
        properties,
      }),
    });
  }
};

const parseSchemaJsDoc = ({ schema }: { schema: IRSchemaObject }) => {
  const comments = [
    schema.description && escapeComment(schema.description),
    schema.deprecated && '@deprecated',
  ];
  return comments;
};

const addJavaScriptEnum = ({
  $ref,
  context,
  schema,
}: {
  $ref: string;
  context: IRContext;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
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
    name: identifier.name,
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
  context,
  schema,
}: {
  $ref: string;
  context: IRContext;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
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
    context.config.types.enums !== 'typescript+namespace'
  ) {
    return;
  }

  const node = compiler.typeAliasDeclaration({
    comment: parseSchemaJsDoc({ schema }),
    exportType: true,
    name: identifier.name,
    type: schemaToType({
      context,
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
  context,
  schema,
}: {
  $ref: string;
  context: IRContext;
  schema: SchemaWithType<'enum'>;
}) => {
  const identifier = context.file({ id: typesId })!.identifier({
    $ref,
    create: true,
    namespace: 'value',
  });

  // TODO: parser - this is the old parser behavior where we would NOT
  // print nested enum identifiers if they already exist. This is a
  // blocker for referencing these identifiers within the file as
  // we cannot guarantee just because they have a duplicate identifier,
  // they have a duplicate value.
  if (
    !identifier.created &&
    context.config.types.enums !== 'typescript+namespace'
  ) {
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
      context,
      schema,
    });
    return node;
  }

  const node = compiler.enumDeclaration({
    leadingComment: parseSchemaJsDoc({ schema }),
    name: identifier.name,
    obj: enumObject.obj,
  });
  return node;
};

const arrayTypeToIdentifier = ({
  context,
  namespace,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'array'>;
}) => {
  if (!schema.items) {
    return compiler.typeArrayNode(
      compiler.keywordTypeNode({
        keyword: 'unknown',
      }),
    );
  }

  return compiler.typeArrayNode(
    schemaToType({
      context,
      namespace,
      schema: {
        ...schema,
        type: undefined,
      },
    }),
  );
};

const booleanTypeToIdentifier = ({
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
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
  context,
  namespace,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'enum'>;
}): ts.TypeNode => {
  // TODO: parser - add option to inline enums
  if ($ref) {
    const isRefComponent = isRefOpenApiComponent($ref);

    // when enums are disabled (default), emit only reusable components
    // as types, otherwise the output would be broken if we skipped all enums
    if (!context.config.types.enums && isRefComponent) {
      const typeNode = addTypeEnum({
        $ref,
        context,
        schema,
      });
      if (typeNode) {
        context.file({ id: typesId })!.add(typeNode);
      }
    }

    if (context.config.types.enums === 'javascript') {
      const typeNode = addTypeEnum({
        $ref,
        context,
        schema,
      });
      if (typeNode) {
        context.file({ id: typesId })!.add(typeNode);
      }

      const objectNode = addJavaScriptEnum({
        $ref,
        context,
        schema,
      });
      if (objectNode) {
        context.file({ id: typesId })!.add(objectNode);
      }
    }

    if (context.config.types.enums === 'typescript') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
        schema,
      });
      if (enumNode) {
        context.file({ id: typesId })!.add(enumNode);
      }
    }

    if (context.config.types.enums === 'typescript+namespace') {
      const enumNode = addTypeScriptEnum({
        $ref,
        context,
        schema,
      });
      if (enumNode) {
        if (isRefComponent) {
          context.file({ id: typesId })!.add(enumNode);
        } else {
          // emit enum inside TypeScript namespace
          namespace.push(enumNode);
        }
      }
    }
  }

  const type = schemaToType({
    context,
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
  context: IRContext;
  namespace: Array<ts.Statement>;
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

const objectTypeToIdentifier = ({
  context,
  namespace,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'object'>;
}) => {
  let indexProperty: Property | undefined;
  const schemaProperties: Array<Property> = [];
  const indexPropertyItems: Array<IRSchemaObject> = [];
  const required = schema.required ?? [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name];
    const isRequired = required.includes(name);
    schemaProperties.push({
      comment: parseSchemaJsDoc({ schema: property }),
      isReadOnly: property.accessScope === 'read',
      isRequired,
      name,
      type: schemaToType({
        $ref: `${irRef}${name}`,
        context,
        namespace,
        schema: property,
      }),
    });
    indexPropertyItems.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  if (schema.additionalProperties) {
    indexPropertyItems.unshift(schema.additionalProperties);

    if (hasOptionalProperties) {
      indexPropertyItems.push({
        type: 'void',
      });
    }

    indexProperty = {
      isRequired: true,
      name: 'key',
      type: schemaToType({
        context,
        namespace,
        schema: {
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
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
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
  }

  return compiler.keywordTypeNode({
    keyword: 'string',
  });
};

const tupleTypeToIdentifier = ({
  context,
  namespace,
  schema,
}: {
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: SchemaWithType<'tuple'>;
}) => {
  const itemTypes: Array<ts.TypeNode> = [];

  for (const item of schema.items ?? []) {
    itemTypes.push(
      schemaToType({
        context,
        namespace,
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
  context,
  namespace,
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace: Array<ts.Statement>;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  switch (schema.type as Required<IRSchemaObject>['type']) {
    case 'array':
      return arrayTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return booleanTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'boolean'>,
      });
    case 'enum':
      return enumTypeToIdentifier({
        $ref,
        context,
        namespace,
        schema: schema as SchemaWithType<'enum'>,
      });
    case 'null':
      return compiler.literalTypeNode({
        literal: compiler.null(),
      });
    case 'number':
      return numberTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'number'>,
      });
    case 'object':
      return objectTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'string'>,
      });
    case 'tuple':
      return tupleTypeToIdentifier({
        context,
        namespace,
        schema: schema as SchemaWithType<'tuple'>,
      });
    case 'unknown':
      return compiler.keywordTypeNode({
        keyword: 'unknown',
      });
    case 'void':
      return compiler.keywordTypeNode({
        keyword: 'undefined',
      });
  }
};

/**
 * Ensure we don't produce redundant types, e.g. string | string.
 */
const deduplicateSchema = ({
  schema,
}: {
  schema: IRSchemaObject;
}): IRSchemaObject => {
  if (!schema.items) {
    return schema;
  }

  const uniqueItems: Array<IRSchemaObject> = [];
  const typeIds: Array<string> = [];

  for (const item of schema.items) {
    // skip nested schemas for now, handle if necessary
    if (
      item.type === 'boolean' ||
      item.type === 'null' ||
      item.type === 'number' ||
      item.type === 'string' ||
      item.type === 'unknown' ||
      item.type === 'void'
    ) {
      const typeId = `${item.$ref ?? ''}${item.type ?? ''}${item.const ?? ''}`;
      if (!typeIds.includes(typeId)) {
        typeIds.push(typeId);
        uniqueItems.push(item);
      }
      continue;
    }

    uniqueItems.push(item);
  }

  schema.items = uniqueItems;

  if (
    schema.items.length <= 1 &&
    schema.type !== 'array' &&
    schema.type !== 'enum' &&
    schema.type !== 'tuple'
  ) {
    // bring the only item up to clean up the schema
    const liftedSchema = schema.items[0];
    delete schema.logicalOperator;
    delete schema.items;
    schema = {
      ...schema,
      ...liftedSchema,
    };
  }

  // exclude unknown if it's the only type left
  if (schema.type === 'unknown') {
    return {};
  }

  return schema;
};

const irParametersToIrSchema = ({
  parameters,
}: {
  parameters: Record<string, IRParameterObject>;
}): IRSchemaObject => {
  const irSchema: IRSchemaObject = {
    type: 'object',
  };

  if (parameters) {
    const properties: Record<string, IRSchemaObject> = {};
    const required: Array<string> = [];

    for (const name in parameters) {
      const parameter = parameters[name];

      properties[name] = deduplicateSchema({
        schema: parameter.schema,
      });

      if (parameter.required) {
        required.push(name);
      }
    }

    irSchema.properties = properties;

    if (required.length) {
      irSchema.required = required;
    }
  }

  return irSchema;
};

const operationToDataType = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) => {
  const data: IRSchemaObject = {
    type: 'object',
  };
  const dataRequired: Array<string> = [];

  if (operation.body) {
    if (!data.properties) {
      data.properties = {};
    }

    data.properties.body = operation.body.schema;

    if (operation.body.required) {
      dataRequired.push('body');
    }
  }

  if (operation.parameters) {
    if (!data.properties) {
      data.properties = {};
    }

    // TODO: parser - handle cookie parameters

    if (operation.parameters.header) {
      data.properties.headers = irParametersToIrSchema({
        parameters: operation.parameters.header,
      });

      if (data.properties.headers.required) {
        dataRequired.push('headers');
      }
    }

    if (operation.parameters.path) {
      data.properties.path = irParametersToIrSchema({
        parameters: operation.parameters.path,
      });

      if (data.properties.path.required) {
        dataRequired.push('path');
      }
    }

    if (operation.parameters.query) {
      data.properties.query = irParametersToIrSchema({
        parameters: operation.parameters.query,
      });

      if (data.properties.query.required) {
        dataRequired.push('query');
      }
    }
  }

  data.required = dataRequired;

  if (data.properties) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: operationDataRef({ id: operation.id }),
      create: true,
      namespace: 'type',
    });
    const node = compiler.typeAliasDeclaration({
      exportType: true,
      name: identifier.name,
      type: schemaToType({
        context,
        schema: data,
      }),
    });
    context.file({ id: typesId })!.add(node);
  }
};

type StatusGroup = '1XX' | '2XX' | '3XX' | '4XX' | '5XX' | 'default';

const statusCodeToGroup = ({
  statusCode,
}: {
  statusCode: string;
}): StatusGroup => {
  switch (statusCode) {
    case '1XX':
      return '1XX';
    case '2XX':
      return '2XX';
    case '3XX':
      return '3XX';
    case '4XX':
      return '4XX';
    case '5XX':
      return '5XX';
    case 'default':
      return 'default';
    default:
      return `${statusCode[0]}XX` as StatusGroup;
  }
};

const operationToResponseTypes = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) => {
  if (!operation.responses) {
    return;
  }

  const errors: IRSchemaObject = {};
  const errorsItems: Array<IRSchemaObject> = [];

  const responses: IRSchemaObject = {};
  const responsesItems: Array<IRSchemaObject> = [];

  let defaultResponse: IRResponseObject | undefined;

  for (const name in operation.responses) {
    const response = operation.responses[name]!;

    switch (statusCodeToGroup({ statusCode: name })) {
      case '1XX':
      case '3XX':
        // TODO: parser - handle informational and redirection status codes
        break;
      case '2XX':
        responsesItems.push(response.schema);
        break;
      case '4XX':
      case '5XX':
        errorsItems.push(response.schema);
        break;
      case 'default':
        // store default response to be evaluated last
        defaultResponse = response;
        break;
    }
  }

  // infer default response type
  if (defaultResponse) {
    let inferred = false;

    // assume default is intended for success if none exists yet
    if (!responsesItems.length) {
      responsesItems.push(defaultResponse.schema);
      inferred = true;
    }

    const description = (
      defaultResponse.schema.description ?? ''
    ).toLocaleLowerCase();
    const $ref = (defaultResponse.schema.$ref ?? '').toLocaleLowerCase();

    // TODO: parser - this could be rewritten using regular expressions
    const successKeywords = ['success'];
    if (
      successKeywords.some(
        (keyword) => description.includes(keyword) || $ref.includes(keyword),
      )
    ) {
      responsesItems.push(defaultResponse.schema);
      inferred = true;
    }

    // TODO: parser - this could be rewritten using regular expressions
    const errorKeywords = ['error', 'problem'];
    if (
      errorKeywords.some(
        (keyword) => description.includes(keyword) || $ref.includes(keyword),
      )
    ) {
      errorsItems.push(defaultResponse.schema);
      inferred = true;
    }

    // if no keyword match, assume default schema is intended for error
    if (!inferred) {
      errorsItems.push(defaultResponse.schema);
    }
  }

  addItemsToSchema({
    items: errorsItems,
    schema: errors,
  });

  addItemsToSchema({
    items: responsesItems,
    schema: responses,
  });

  if (errors.items) {
    const deduplicatedSchema = deduplicateSchema({
      schema: errors,
    });
    if (Object.keys(deduplicatedSchema).length) {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref: operationErrorRef({ id: operation.id }),
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifier.name,
        type: schemaToType({
          context,
          schema: deduplicatedSchema,
        }),
      });
      context.file({ id: typesId })!.add(node);
    }
  }

  if (responses.items) {
    const deduplicatedSchema = deduplicateSchema({
      schema: responses,
    });
    if (Object.keys(deduplicatedSchema).length) {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref: operationResponseRef({ id: operation.id }),
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        exportType: true,
        name: identifier.name,
        type: schemaToType({
          context,
          schema: deduplicatedSchema,
        }),
      });
      context.file({ id: typesId })!.add(node);
    }
  }
};

const operationToType = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) => {
  operationToDataType({
    context,
    operation,
  });

  operationToResponseTypes({
    context,
    operation,
  });
};

const schemaToType = ({
  $ref,
  context,
  namespace = [],
  schema,
}: {
  $ref?: string;
  context: IRContext;
  namespace?: Array<ts.Statement>;
  schema: IRSchemaObject;
}): ts.TypeNode => {
  let type: ts.TypeNode | undefined;

  if (schema.$ref) {
    const identifier = context.file({ id: typesId })!.identifier({
      $ref: schema.$ref,
      create: true,
      namespace: 'type',
    });
    type = compiler.typeReferenceNode({
      typeName: identifier.name,
    });
  } else if (schema.type) {
    type = schemaTypeToIdentifier({
      $ref,
      context,
      namespace,
      schema,
    });
  } else if (schema.items) {
    const itemTypes = schema.items.map((item) =>
      schemaToType({
        context,
        namespace,
        schema: item,
      }),
    );
    type =
      schema.logicalOperator === 'and'
        ? compiler.typeIntersectionNode({ types: itemTypes })
        : compiler.typeUnionNode({ types: itemTypes });
  } else {
    // catch-all fallback for failed schemas
    type = schemaTypeToIdentifier({
      context,
      namespace,
      schema: {
        type: 'unknown',
      },
    });
  }

  // emit nodes only if $ref points to a reusable component
  if ($ref && isRefOpenApiComponent($ref)) {
    // emit namespace if it has any members
    if (namespace.length) {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref,
        create: true,
        namespace: 'value',
      });
      const node = compiler.namespaceDeclaration({
        name: identifier.name,
        statements: namespace,
      });
      context.file({ id: typesId })!.add(node);
    }

    // enum handler emits its own artifacts
    if (schema.type !== 'enum') {
      const identifier = context.file({ id: typesId })!.identifier({
        $ref,
        create: true,
        namespace: 'type',
      });
      const node = compiler.typeAliasDeclaration({
        comment: parseSchemaJsDoc({ schema }),
        exportType: true,
        name: identifier.name,
        type,
      });
      context.file({ id: typesId })!.add(node);
    }
  }

  return type;
};

export const generateLegacyTypes = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}): Promise<void> => {
  const config = getConfig();

  if (config.types.export) {
    files.types = new TypeScriptFile({
      dir: config.output.path,
      name: 'types.ts',
    });
  }

  const onNode: TypesProps['onNode'] = (node) => {
    files.types?.add(node);
  };

  for (const model of client.models) {
    processModel({ client, model, onNode });
  }

  processServiceTypes({ client, onNode });
};

export const generateTypes = ({ context }: { context: IRContext }): void => {
  // TODO: parser - once types are a plugin, this logic can be simplified
  if (!context.config.types.export) {
    return;
  }

  context.createFile({
    id: typesId,
    path: 'types',
  });

  if (context.ir.components) {
    for (const name in context.ir.components.schemas) {
      const schema = context.ir.components.schemas[name];

      schemaToType({
        $ref: `#/components/schemas/${name}`,
        context,
        schema,
      });
    }

    for (const name in context.ir.components.parameters) {
      const parameter = context.ir.components.parameters[name];

      schemaToType({
        $ref: `#/components/parameters/${name}`,
        context,
        schema: parameter.schema,
      });
    }
  }

  // TODO: parser - once types are a plugin, this logic can be simplified
  // provide config option on types to generate path types and services
  // will set it to true if needed
  if (context.config.services.export || context.config.types.tree) {
    for (const path in context.ir.paths) {
      const pathItem = context.ir.paths[path as keyof IRPathsObject];

      if (pathItem.delete) {
        operationToType({
          context,
          operation: pathItem.delete,
        });
      }

      if (pathItem.get) {
        operationToType({
          context,
          operation: pathItem.get,
        });
      }

      if (pathItem.head) {
        operationToType({
          context,
          operation: pathItem.head,
        });
      }

      if (pathItem.options) {
        operationToType({
          context,
          operation: pathItem.options,
        });
      }

      if (pathItem.patch) {
        operationToType({
          context,
          operation: pathItem.patch,
        });
      }

      if (pathItem.post) {
        operationToType({
          context,
          operation: pathItem.post,
        });
      }

      if (pathItem.put) {
        operationToType({
          context,
          operation: pathItem.put,
        });
      }

      if (pathItem.trace) {
        operationToType({
          context,
          operation: pathItem.trace,
        });
      }
    }

    // TODO: parser - document removal of tree? migrate it?
  }
};
