import {
  type Comments,
  compiler,
  type Node,
  TypeScriptFile,
} from '../../compiler';
import { addLeadingComment } from '../../compiler/utils';
import type { Model, OperationParameter, Service } from '../../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../openApi/common/parser/sanitize';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { sortByName } from '../sort';
import { transformName } from '../transform';
import { serviceExportedNamespace } from './services';
import { toType } from './type';

type OnNode = (node: Node, type?: 'enum') => void;

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

const processComposition = (client: Client, model: Model, onNode: OnNode) => {
  processType(client, model, onNode);
  model.enums.forEach((enumerator) => processEnum(client, enumerator, onNode));
};

const processEnum = (
  client: Client,
  model: Model,
  onNode: OnNode,
  exportType = false,
) => {
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

  // ignore duplicate enum names
  const name = enumName(client, model.name)!;
  if (name === null) {
    return;
  }

  const comment = [
    model.description && escapeComment(model.description),
    model.deprecated && '@deprecated',
  ];

  if (exportType) {
    const node = compiler.typedef.alias(
      ensureValidTypeScriptJavaScriptIdentifier(model.name),
      enumUnionType(model.enum),
      comment,
    );
    onNode(node);
  }

  if (config.enums === 'typescript') {
    const node = compiler.types.enum({
      comments,
      leadingComment: comment,
      name,
      obj: properties,
    });
    onNode(node, 'enum');
  }

  if (config.enums === 'javascript') {
    const expression = compiler.types.object({
      comments,
      multiLine: true,
      obj: properties,
      unescape: true,
    });
    const node = compiler.export.asConst(name, expression);
    addLeadingComment(node, comment);
    onNode(node, 'enum');
  }
};

const processType = (client: Client, model: Model, onNode: OnNode) => {
  const comment = [
    model.description && escapeComment(model.description),
    model.deprecated && '@deprecated',
  ];
  const node = compiler.typedef.alias(
    transformName(model.name),
    toType(model),
    comment,
  );
  onNode(node);
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

const processServiceTypes = (services: Service[], onNode: OnNode) => {
  type ResMap = Map<number, Model>;
  type MethodMap = Map<'req' | 'res', ResMap | OperationParameter[]>;
  type MethodKey = Service['operations'][number]['method'];
  type PathMap = Map<MethodKey, MethodMap>;

  const pathsMap = new Map<string, PathMap>();

  services.forEach((service) => {
    service.operations.forEach((operation) => {
      const hasReq = operation.parameters.length;
      const hasRes = operation.results.length;

      if (hasReq || hasRes) {
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
          methodMap.set('req', sortByName([...operation.parameters]));
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
            export: 'interface',
            isRequired: true,
            name,
            properties: reqResParameters,
          };
          return reqResKey;
        },
      );
      const methodKey: Model = {
        ...emptyModel,
        export: 'interface',
        isRequired: true,
        name: method.toLocaleLowerCase(),
        properties: methodParameters,
      };
      return methodKey;
    });
    const pathKey: Model = {
      ...emptyModel,
      export: 'interface',
      isRequired: true,
      name: `'${path}'`,
      properties: pathParameters,
    };
    return pathKey;
  });

  const type = toType({
    ...emptyModel,
    export: 'interface',
    properties,
  });
  const namespace = serviceExportedNamespace();
  const node = compiler.typedef.alias(namespace, type);
  onNode(node);
};

export const processTypesAndEnums = async ({
  client,
  files,
}: {
  client: Client;
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  for (const model of client.models) {
    processModel(client, model, (node, type) => {
      if (type === 'enum') {
        files.enums?.add(node);
      } else {
        files.types?.add(node);
      }
    });
  }

  if (files.services && client.services.length) {
    processServiceTypes(client.services, (node) => {
      files.types?.add(node);
    });
  }
};
