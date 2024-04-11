import path from 'node:path';

import { type Comments, compiler, type Node, TypeScriptFile } from '../../compiler';
import type { Model, OpenApi, OperationParameter, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumUnionType, enumValue, javascriptEnumName, javascriptPreservedEnumName } from '../enum';
import { escapeComment } from '../escape';
import { serviceExportedNamespace } from '../handlebars';
import { sortByName } from '../sort';
import { toType } from './type';

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

const processComposition = (client: Client, model: Model) => [
    processType(client, model),
    ...model.enums.flatMap(enumerator => processEnum(client, enumerator, false)),
];

const processEnum = (client: Client, model: Model, exportType: boolean) => {
    const config = getConfig();
    let nodes: Array<Node> = [];

    const properties: Record<string | number, unknown> = {};
    const comments: Record<string | number, Comments> = {};
    model.enum.forEach(enumerator => {
        const key = enumKey(enumerator.value, enumerator.customName);
        const value = enumValue(enumerator.value);
        properties[key] = value;
        const comment = enumerator.customDescription || enumerator.description;
        if (comment) {
            comments[key] = [escapeComment(comment)];
        }
    });

    if (exportType) {
        const comment: Comments = [
            model.description && escapeComment(model.description),
            model.deprecated && '@deprecated',
        ];
        if (config.enums === 'typescript') {
            nodes = [...nodes, compiler.types.enum(model.name, properties, comment, comments)];
        } else {
            nodes = [...nodes, compiler.typedef.alias(model.name, enumUnionType(model.enum), comment)];
        }
    }

    if (['javascript', 'javascript-preserve-name'].includes(config.enums as string)) {
        const expression = compiler.types.object(properties, {
            comments,
            multiLine: true,
            unescape: true,
        });
        const preserveName = config.enums === 'javascript-preserve-name';
        const outputEnumName = preserveName
            ? javascriptPreservedEnumName(client, model.name)!
            : javascriptEnumName(client, model.name)!;
        nodes = [...nodes, compiler.export.asConst(outputEnumName, expression)];
    }

    return nodes;
};

const processType = (client: Client, model: Model) => {
    const comment: Comments = [
        model.description && escapeComment(model.description),
        model.deprecated && '@deprecated',
    ];
    return compiler.typedef.alias(model.name, toType(model), comment);
};

const processModel = (client: Client, model: Model) => {
    switch (model.export) {
        case 'all-of':
        case 'any-of':
        case 'one-of':
        case 'interface':
            return processComposition(client, model);
        case 'enum':
            return processEnum(client, model, true);
        default:
            return processType(client, model);
    }
};

const processServiceTypes = (services: Service[]) => {
    type ResMap = Map<number, Model>;
    type MethodMap = Map<'req' | 'res', ResMap | OperationParameter[]>;
    type MethodKey = Service['operations'][number]['method'];
    type PathMap = Map<MethodKey, MethodMap>;

    const pathsMap = new Map<string, PathMap>();

    services.forEach(service => {
        service.operations.forEach(operation => {
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

                    operation.results.forEach(result => {
                        resMap.set(result.code, result);
                    });
                }
            }
        });
    });

    const properties = Array.from(pathsMap).map(([path, pathMap]) => {
        const pathParameters = Array.from(pathMap).map(([method, methodMap]) => {
            const methodParameters = Array.from(methodMap).map(([name, baseOrResMap]) => {
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
            });
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
    return compiler.typedef.alias(namespace, type);
};

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 */
export const writeClientModels = async (openApi: OpenApi, outputPath: string, client: Client): Promise<void> => {
    const file = new TypeScriptFile().addHeader();

    for (const model of client.models) {
        const nodes = processModel(client, model);
        const n = Array.isArray(nodes) ? nodes : [nodes];
        file.add(...n);
    }

    if (client.services.length) {
        const serviceTypes = processServiceTypes(client.services);
        file.add(serviceTypes);
    }

    file.write(path.resolve(outputPath, 'models.ts'), '\n\n');
};
