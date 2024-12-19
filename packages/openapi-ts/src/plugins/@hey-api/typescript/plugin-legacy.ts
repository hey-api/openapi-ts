import type { EnumDeclaration } from 'typescript';

import { type Comments, compiler, type Node } from '../../../compiler';
import { TypeScriptFile } from '../../../generate/files';
import { isOperationParameterRequired } from '../../../openApi';
import type {
  Client,
  Method,
  Model,
  OperationParameter,
} from '../../../types/client';
import { getConfig, isLegacyClient } from '../../../utils/config';
import { enumEntry, enumUnionType } from '../../../utils/enum';
import { escapeComment } from '../../../utils/escape';
import { sortByName, sorterByName } from '../../../utils/sort';
import {
  setUniqueTypeName,
  type SetUniqueTypeNameResult,
  toType,
} from '../../../utils/type';
import type { Plugin } from '../../types';
import {
  operationDataTypeName,
  operationErrorTypeName,
  operationResponseTypeName,
} from '../sdk/plugin-legacy';
import type { Config } from './types';

export interface TypesProps {
  client: Client;
  model: Model;
  onNode: (node: Node) => void;
  onRemoveNode?: VoidFunction;
}

const treeName = '$OpenApiTs';

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
  comments,
  leadingComment,
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
    if (
      config.plugins['@hey-api/typescript']?.enums !== 'typescript+namespace'
    ) {
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
    config.plugins['@hey-api/typescript']?.enums === 'typescript' ||
    config.plugins['@hey-api/typescript']?.enums === 'typescript+namespace'
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
      if (config.plugins['@hey-api/typescript']?.enums === 'javascript') {
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

  if (
    !config.plugins['@hey-api/sdk'] &&
    !config.plugins['@hey-api/typescript']?.tree
  ) {
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
            ...bodyParameter[0]!,
            in: 'body',
            isRequired: bodyParameter[0]!.isRequired,
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

  if (config.plugins['@hey-api/typescript']?.tree) {
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

export const handlerLegacy: Plugin.LegacyHandler<Config> = ({
  client,
  files,
}) => {
  const config = getConfig();

  files.types = new TypeScriptFile({
    dir: config.output.path,
    name: 'types.ts',
  });

  const onNode: TypesProps['onNode'] = (node) => {
    files.types?.add(node);
  };

  for (const model of client.models) {
    processModel({ client, model, onNode });
  }

  processServiceTypes({ client, onNode });
};
