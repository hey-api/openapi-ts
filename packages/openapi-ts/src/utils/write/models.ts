import path from 'node:path';

import camelCase from 'camelcase';

import { type Comments, compiler, type Node, TypeScriptFile } from '../../compiler';
import type { Model, OpenApi, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { operationKey } from '../handlebars';
import { modelIsRequired } from '../required';
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
        const key = enumKey(enumerator.value, enumerator['x-enum-varname']);
        const value = enumValue(enumerator.value);
        properties[key] = value;
        const comment = enumerator['x-enum-description'] || enumerator.description;
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

const operationDataType = (service: Service) => {
    const config = getConfig();
    const operationsWithParameters = service.operations.filter(operation => operation.parameters.length);
    const namespace = `${camelCase(service.name, { pascalCase: true })}Data`;
    const output = `export type ${namespace} = {
        ${
            operationsWithParameters.length
                ? `
        payloads: {
            ${operationsWithParameters
                .map(
                    operation => `${operationKey(operation)}: {
                        ${sortByName([...operation.parameters])
                            .filter(parameter => {
                                if (!config.experimental) {
                                    return true;
                                }
                                return parameter.in !== 'query';
                            })
                            .map(parameter => {
                                let comment: string[] = [];
                                if (parameter.description) {
                                    comment = ['/**', ` * ${escapeComment(parameter.description)}`, ' */'];
                                }
                                return [
                                    ...comment,
                                    `${parameter.name + modelIsRequired(parameter)}: ${toType(parameter)}`,
                                ].join('\n');
                            })
                            .join('\n')}
                        ${
                            config.experimental
                                ? `
                        query${operation.parametersQuery.every(parameter => !parameter.isRequired) ? '?' : ''}: {
                            ${sortByName([...operation.parametersQuery])
                                .map(parameter => {
                                    let comment: string[] = [];
                                    if (parameter.description) {
                                        comment = ['/**', ` * ${escapeComment(parameter.description)}`, ' */'];
                                    }
                                    return [
                                        ...comment,
                                        `${parameter.name + modelIsRequired(parameter)}: ${toType(parameter)}`,
                                    ].join('\n');
                                })
                                .join('\n')}
                        }
                        `
                                : ''
                        }
                    };`
                )
                .join('\n')}
        }
        `
                : ''
        }
        ${
            service.operations.length
                ? `
        responses: {
            ${service.operations.map(
                operation =>
                    `${operationKey(operation)}: ${
                        !operation.results.length ? 'void' : operation.results.map(result => toType(result)).join(' | ')
                    }
                `
            )}
        }
        `
                : ''
        }
    }`;
    return output;
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

    for (const service of client.services) {
        const operationDataTypes = operationDataType(service);
        file.add(operationDataTypes);
    }

    file.write(path.resolve(outputPath, 'models.ts'), '\n\n');
};
