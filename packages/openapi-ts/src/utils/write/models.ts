import path from 'node:path';

import { type Comments, compiler, type Node, TypeScriptFile } from '../../compiler';
import type { Model, OpenApi, OperationParameter, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { serviceExportedNamespace } from '../handlebars';
import { sortByName } from '../sort';
import { toType } from './type';

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
            comments[key] = [` * ${escapeComment(comment)}`];
        }
    });

    if (exportType) {
        const comment: Comments = [
            model.description && ` * ${escapeComment(model.description)}`,
            model.deprecated && ' * @deprecated',
        ];
        if (config.enums === 'typescript') {
            nodes = [...nodes, compiler.types.enum(model.name, properties, comment, comments)];
        } else {
            nodes = [...nodes, compiler.typedef.alias(model.name, enumUnionType(model.enum), comment)];
        }
    }

    if (config.enums === 'javascript') {
        const expression = compiler.types.object(properties, {
            comments,
            multiLine: true,
            unescape: true,
        });
        nodes = [...nodes, compiler.export.asConst(enumName(client, model.name)!, expression)];
    }

    return nodes;
};

const processType = (client: Client, model: Model) => {
    const comment: Comments = [
        model.description && ` * ${escapeComment(model.description)}`,
        model.deprecated && ' * @deprecated',
    ];
    const type = toType(model);
    return compiler.typedef.alias(model.name, type!, comment);
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
    type ReqMap = Map<number, OperationParameter[]>;
    type Base = string;
    type MethodMap = Map<'req' | 'res', Base | ReqMap | OperationParameter[]>;
    type MethodKey = Service['operations'][number]['method'];
    type PathMap = Map<MethodKey, MethodMap>;

    const pathsMap = new Map<string, PathMap>();

    services.forEach(service => {
        service.operations.forEach(operation => {
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

            if (operation.parameters.length) {
                methodMap.set('req', operation.parameters);
            }

            // operation.results.forEach(result => {
            //     let reqMap = methodMap.get('req');
            //     if (!reqMap) {
            //         methodMap.set('req', new Map());
            //         reqMap = methodMap.get('req')!;
            //     }

            //     if (typeof reqMap === 'string') {
            //         return;
            //     }

            //     reqMap.set(
            //         // result.code,
            //         200,
            //         operation.parameters,
            //     );
            // })

            methodMap.set(
                'res',
                !operation.results.length ? 'void' : operation.results.map(result => toType(result)).join(' | ')
            );
        });
    });

    const properties = Array.from(pathsMap).map(([path, pathMap]) => {
        const pathParameters = Array.from(pathMap).map(([method, methodMap]) => {
            const methodParameters = Array.from(methodMap).map(([name, baseOrReqMap]) => {
                if (typeof baseOrReqMap !== 'string') {
                    const reqParameters = Array.isArray(baseOrReqMap)
                        ? baseOrReqMap
                        : Array.from(baseOrReqMap).map(([code, operationParameters]) => {
                              const value: Model = {
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
                                  isRequired: true,
                                  link: null,
                                  name: String(code),
                                  // TODO: move query params into separate query key
                                  properties: sortByName([...operationParameters]),
                                  template: null,
                                  type: '',
                              };
                              return value;
                          });

                    const reqKey: Model = {
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
                        isRequired: true,
                        link: null,
                        name,
                        properties: reqParameters,
                        template: null,
                        type: '',
                    };
                    return reqKey;
                }

                const value: Model = {
                    $refs: [],
                    base: baseOrReqMap,
                    description: null,
                    enum: [],
                    enums: [],
                    export: 'generic',
                    imports: [],
                    isDefinition: false,
                    isNullable: false,
                    isReadOnly: false,
                    isRequired: true,
                    link: null,
                    name,
                    properties: [],
                    template: null,
                    type: '',
                };
                return value;
            });
            const methodKey: Model = {
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
                isRequired: true,
                link: null,
                name: method.toLocaleLowerCase(),
                properties: methodParameters,
                template: null,
                type: '',
            };
            return methodKey;
        });
        const pathKey: Model = {
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
            isRequired: true,
            link: null,
            name: `'${path}'`,
            properties: pathParameters,
            template: null,
            type: '',
        };
        return pathKey;
    });

    const type = toType({
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
        properties,
        template: null,
        type: '',
    });
    const namespace = serviceExportedNamespace();
    return compiler.typedef.alias(namespace, type!);
};

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 */
export const writeClientModels = async (openApi: OpenApi, outputPath: string, client: Client): Promise<void> => {
    const file = new TypeScriptFile();

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
