import {
  type Comments,
  compiler,
  type Node,
  TypeScriptFile,
} from '../../compiler';
import type { Model, OperationParameter, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { sortByName, sorterByName } from '../sort';
import { operationDataTypeName, operationResponseTypeName } from './services';
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

  const { created, name } = uniqueTypeName({ meta, ...uniqueTypeNameArgs });
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

  const { created, name } = uniqueTypeName({ meta, ...uniqueTypeNameArgs });
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

const processEnum = (
  client: Client,
  model: Model,
  onNode: OnNode,
  isExported: boolean = false,
) => {
  if (!isExported) {
    return;
  }

  const config = getConfig();

  const properties: Record<string | number, unknown> = {};
  const comments: Record<string | number, Comments> = {};
  model.enum.forEach((enumerator) => {
    const key = enumKey(enumerator.value, enumerator.customName);
    const value = enumValue(enumerator.value);
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
          leadingComment: comment,
          multiLine: true,
          obj: properties,
          unescape: true,
        });
        const node = compiler.export.const({
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
};

const processModel = (client: Client, model: Model, onNode: OnNode) => {
  switch (model.export) {
    case 'all-of':
    case 'any-of':
    case 'one-of':
    case 'interface':
      return processComposition(client, model, onNode);
    case 'enum':
      return processEnum(client, model, onNode, true);
    default:
      return processType(client, model, onNode);
  }
};

const processServiceTypes = (client: Client, onNode: OnNode) => {
  type ResMap = Map<number | 'default', Model>;
  type MethodMap = Map<'req' | 'res', ResMap | OperationParameter[]>;
  type MethodKey = Service['operations'][number]['method'];
  type PathMap = Map<MethodKey, MethodMap>;

  const pathsMap = new Map<string, PathMap>();

  const config = getConfig();

  client.services.forEach((service) => {
    service.operations.forEach((operation) => {
      const hasReq = operation.parameters.length;
      const hasRes = operation.results.length;
      const hasErr = operation.errors.length;

      if (hasReq || hasRes || hasErr) {
        let pathMap = pathsMap.get(operation.path);
        if (!pathMap) {
          pathsMap.set(operation.path, new Map());
          pathMap = pathsMap.get(operation.path)!;
        }

        let methodMap = pathMap.get(operation.method);
        if (!methodMap) {
          pathMap.set(operation.method, new Map());
          methodMap = pathMap.get(operation.method)!;
        }

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
            name: 'header',
            prop: 'header',
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
          const operationProperties = config.client.startsWith('@hey-api')
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

          methodMap.set('req', operationProperties);

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
          let resMap = methodMap.get('res');
          if (!resMap) {
            methodMap.set('res', new Map());
            resMap = methodMap.get('res')!;
          }

          if (Array.isArray(resMap)) {
            return;
          }

          operation.results.forEach((result) => {
            resMap.set(result.code, result);
          });

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
              properties: operation.results.filter(
                (result) =>
                  result.code === 'default' ||
                  (result.code >= 200 && result.code < 300),
              ),
            }),
          });
        }

        if (hasErr) {
          let resMap = methodMap.get('res');
          if (!resMap) {
            methodMap.set('res', new Map());
            resMap = methodMap.get('res')!;
          }

          if (Array.isArray(resMap)) {
            return;
          }

          operation.errors.forEach((error) => {
            resMap.set(error.code, error);
          });
        }
      }
    });
  });

  const properties = Array.from(pathsMap).map(([path, pathMap]) => {
    const pathParameters = Array.from(pathMap).map(([method, methodMap]) => {
      const methodParameters = Array.from(methodMap).map(
        ([name, baseOrResMap]) => {
          const reqResParameters = Array.isArray(baseOrResMap)
            ? baseOrResMap
            : Array.from(baseOrResMap).map(([code, base]) => {
                // TODO: move query params into separate query key
                const value: Model = {
                  ...emptyModel,
                  ...base,
                  isRequired: true,
                  name: String(code),
                };
                return value;
              });

          const reqResKey: Model = {
            ...emptyModel,
            isRequired: true,
            name,
            properties: reqResParameters,
          };
          return reqResKey;
        },
      );
      const methodKey: Model = {
        ...emptyModel,
        isRequired: true,
        name: method.toLocaleLowerCase(),
        properties: methodParameters,
      };
      return methodKey;
    });
    const pathKey: Model = {
      ...emptyModel,
      isRequired: true,
      name: `'${path}'`,
      properties: pathParameters,
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
