import ts from 'typescript';

import {
  type Comments,
  compiler,
  type Node,
  TypeScriptFile,
} from '../../compiler';
import type { Model, OperationParameter } from '../../openApi';
import type { Method } from '../../openApi/common/interfaces/client';
import {
  getErrorResponses,
  getSuccessResponses,
} from '../../openApi/common/parser/operation';
import type { Client } from '../../types/client';
import { getConfig, isStandaloneClient } from '../config';
import { enumEntry, enumUnionType } from '../enum';
import { escapeComment } from '../escape';
import { sortByName, sorterByName } from '../sort';
import {
  operationDataTypeName,
  operationErrorTypeName,
  operationResponseTypeName,
} from './services';
import { toType, uniqueTypeName } from './type';

type OnNode = (node: Node) => void;

const serviceExportedNamespace = () => '$OpenApiTs';

const emptyModel: Model = {
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
  ...uniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.types.enum>[0], 'name'> &
  Pick<Parameters<typeof uniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> & {
    onNode: OnNode;
  }) => {
  // generate types only for top-level models
  if (!meta) {
    return;
  }

  const { created, name } = uniqueTypeName({
    create: true,
    meta,
    ...uniqueTypeNameArgs,
  });
  if (created) {
    const node = compiler.types.enum({
      comments,
      leadingComment,
      name,
      obj,
    });
    onNode(node);
  }
};

const generateType = ({
  comment,
  meta,
  onCreated,
  onNode,
  type,
  ...uniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.typedef.alias>[0], 'name'> &
  Pick<Parameters<typeof uniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> & {
    onCreated?: (name: string) => void;
    onNode: OnNode;
  }) => {
  // generate types only for top-level models
  if (!meta) {
    return;
  }

  const { created, name } = uniqueTypeName({
    create: true,
    meta,
    ...uniqueTypeNameArgs,
  });
  if (created) {
    const node = compiler.typedef.alias({ comment, name, type });
    onNode(node);

    onCreated?.(name);
  }
};

const processComposition = (client: Client, model: Model, onNode: OnNode) => {
  processType(client, model, onNode);
  model.enums.forEach((enumerator) => processEnum(client, enumerator, onNode));
};

const processEnum = (client: Client, model: Model, onNode: OnNode) => {
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

  if (config.types.enums === 'typescript') {
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
        const expression = compiler.types.object({
          comments,
          multiLine: true,
          obj: properties,
          unescape: true,
        });
        const node = compiler.export.const({
          comment,
          constAssertion: true,
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

const processType = (client: Client, model: Model, onNode: OnNode) => {
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

  generateTransform(client, model, onNode);
};

const generateTransform = (client: Client, model: Model, onNode: OnNode) => {
  const config = getConfig();
  if (config.types.dates === 'types+transform') {
    if (model.meta?.hasTransformer) {
      // Transform already created (maybe the model is used in other models) so we just bail here
      return;
    }

    const generateForProperty = (
      rootPath: string[],
      property: Model,
      isArrayElement?: boolean,
    ) => {
      const localPath = [...rootPath, property.name];

      if (
        property.type === 'string' &&
        property.export !== 'array' &&
        (property.format === 'date-time' || property.format === 'date')
      ) {
        return [
          compiler.transform.dateTransformMutation({
            path: localPath,
          }),
        ];
      } else if (isArrayElement) {
        // Avoid infinite recursion on arrays
        return [];
      } else {
        // otherwise we recurse in case it's an object/array, and if it's not that will just bail with []
        return generateForModel(localPath, property);
      }
    };

    function generateForArray(localPath: string[], localModel: Model) {
      if (localModel.export !== 'array') {
        throw new Error(
          'generateForArray should only be called with array models',
        );
      }

      if (localModel.$refs.length === 1) {
        const nextModel = client.models.find(
          (m) => m.meta!.name === localModel.type,
        );
        if (!nextModel) {
          throw new Error(
            `Model ${localModel.type} could not be founded when building array transform`,
          );
        }

        generateTransform(client, nextModel, onNode);

        return [
          compiler.transform.arrayTransformMutation({
            path: localPath,
            transformer: nextModel.meta!.name,
          }),
        ];
      }

      if (localModel.format === 'date' || localModel.format === 'date-time') {
        return [
          compiler.transform.mapArray({
            path: localPath,
            transformExpression: compiler.transform.newDate({
              parameterName: 'item',
            }),
          }),
        ];
      }

      // Not transform for this type
      return [];
    }

    function generateForModel(
      localPath: string[],
      localModel: Model,
    ): ts.Statement[] {
      switch (localModel.export) {
        case 'interface':
          return localModel.properties.flatMap((property) =>
            generateForProperty(localPath, property),
          );
        case 'array':
          return generateForArray(localPath, localModel);

        default:
          // Unsupported
          return [];
      }
    }

    const transformStatements = generateForModel(['data'], model);
    if (transformStatements.length > 0) {
      const transformFunction = compiler.transform.transformMutationFunction({
        modelName: model.name,
        statements: transformStatements,
      });

      client.types[model.meta!.name].hasTransformer = true;

      onNode(transformFunction);
    }
  }
};

const processModel = (client: Client, model: Model, onNode: OnNode) => {
  switch (model.export) {
    case 'all-of':
    case 'any-of':
    case 'one-of':
    case 'interface':
      return processComposition(client, model, onNode);
    case 'enum':
      return processEnum(client, model, onNode);
    default:
      return processType(client, model, onNode);
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

const processServiceTypes = (client: Client, onNode: OnNode) => {
  const pathsMap: PathsMap = {};

  const config = getConfig();

  const isStandalone = isStandaloneClient(config);

  client.services.forEach((service) => {
    service.operations.forEach((operation) => {
      const hasReq = operation.parameters.length;
      const hasRes = operation.results.length;
      const hasErr = operation.errors.length;

      if (!hasReq && !hasRes && !hasErr) {
        return;
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

      if (hasReq) {
        const bodyParameter = operation.parameters
          .filter((parameter) => parameter.in === 'body')
          .sort(sorterByName)[0];
        const bodyParameters: OperationParameter = {
          ...emptyModel,
          ...bodyParameter,
          in: 'body',
          isRequired: bodyParameter ? bodyParameter.isRequired : false,
          // mediaType: null,
          name: 'body',
          prop: 'body',
        };
        const headerParameters: OperationParameter = {
          ...emptyModel,
          in: 'header',
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'header')
            .some((parameter) => parameter.isRequired),
          mediaType: null,
          name: isStandalone ? 'headers' : 'header',
          prop: isStandalone ? 'headers' : 'header',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'header')
            .sort(sorterByName),
        };
        const pathParameters: OperationParameter = {
          ...emptyModel,
          in: 'path',
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'path')
            .some((parameter) => parameter.isRequired),
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
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'query')
            .some((parameter) => parameter.isRequired),
          mediaType: null,
          name: 'query',
          prop: 'query',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'query')
            .sort(sorterByName),
        };
        const operationProperties = isStandalone
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

      if (hasRes) {
        if (!methodMap.res) {
          methodMap.res = {};
        }

        if (Array.isArray(methodMap.res)) {
          return;
        }

        operation.results.forEach((result) => {
          methodMap.res![result.code] = result;
        });

        const responses = getSuccessResponses(operation.results);

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
            properties: responses,
          }),
        });

        if (
          config.types.dates === 'types+transform' &&
          responses.length === 1
        ) {
          if (client.types[responses[0].type]?.hasTransformer) {
            const name = operationResponseTypeName(operation.name);
            const transformAlias = compiler.transform.alias({
              existingName: responses[0].type,
              name,
            });

            client.types[name].hasTransformer = true;

            onNode(transformAlias);
          }
        }

        if (isStandaloneClient(config)) {
          const errorResults = getErrorResponses(operation.results);
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
              errorResults.length
                ? {
                    ...emptyModel,
                    export: 'all-of',
                    isRequired: true,
                    properties: errorResults,
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

      if (hasErr) {
        if (!methodMap.res) {
          methodMap.res = {};
        }

        if (Array.isArray(methodMap.res)) {
          return;
        }

        operation.errors.forEach((error) => {
          methodMap.res![error.code] = error;
        });
      }
    });
  });

  const properties = Object.entries(pathsMap).map(([path, pathMap]) => {
    const pathParameters = Object.entries(pathMap)
      .map(([_method, methodMap]) => {
        const method = _method as Method;

        let methodParameters: Model[] = [];

        if (methodMap.req) {
          const operationName = methodMap.$ref!;
          const { name: base } = uniqueTypeName({
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

  generateType({
    client,
    meta: {
      $ref: '@hey-api/openapi-ts',
      name: serviceExportedNamespace(),
    },
    onNode,
    type: toType({
      ...emptyModel,
      properties,
    }),
  });
};

export const processTypes = async ({
  client,
  files,
}: {
  client: Client;
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  for (const model of client.models) {
    processModel(client, model, (node) => {
      files.types?.add(node);
    });
  }

  if (files.services && client.services.length) {
    processServiceTypes(client, (node) => {
      files.types?.add(node);
    });
  }
};
