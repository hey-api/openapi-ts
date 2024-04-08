import path from 'node:path';

import camelCase from 'camelcase';
import ts from 'typescript';

import { compiler, TypeScriptFile } from '../../compiler';
import { toExpression } from '../../compiler/types';
import { addLeadingJSDocComment } from '../../compiler/utils';
import { isType } from '../../compiler/utils';
import type { Model, OpenApi, Service } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { operationKey } from '../handlebars';
import { modelIsRequired } from '../required';
import { sortByName } from '../sort';
import { toType } from './type';

const processComposition = (config: Config, client: Client, model: Model) => [
    processType(config, client, model),
    ...model.enums.flatMap(enumerator => processEnum(config, client, enumerator, false)),
];

const processEnum = (config: Config, client: Client, model: Model, exportType: boolean) => {
    let nodes: Array<ts.Node> = [];

    if (exportType) {
        if (config.enums === 'typescript') {
            const typeDeclaration = ts.factory.createEnumDeclaration(
                [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                ts.factory.createIdentifier(model.name),
                model.enum.map(enumerator => {
                    const key = enumKey(enumerator.value, enumerator['x-enum-varname']);
                    const initializer = toExpression(enumValue(enumerator.value), true);
                    const assignment = ts.factory.createEnumMember(key, initializer);
                    const comment = enumerator['x-enum-description'] || enumerator.description;
                    if (comment) {
                        addLeadingJSDocComment(assignment, [` * ${escapeComment(comment)}`]);
                    }
                    return assignment;
                })
            );
            nodes = [...nodes, typeDeclaration];
        } else {
            const typeDeclaration = ts.factory.createTypeAliasDeclaration(
                [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                ts.factory.createIdentifier(model.name),
                undefined,
                ts.factory.createTypeReferenceNode(enumUnionType(model.enum))
            );
            nodes = [...nodes, typeDeclaration];
        }

        if (model.description || model.deprecated) {
            addLeadingJSDocComment(nodes[0], [
                model.description && ` * ${escapeComment(model.description)}`,
                model.deprecated && ' * @deprecated',
            ]);
        }
    }

    if (config.enums === 'javascript') {
        const expression = ts.factory.createObjectLiteralExpression(
            model.enum
                .map(enumerator => {
                    const key = enumKey(enumerator.value, enumerator['x-enum-varname']);
                    const initializer = toExpression(enumValue(enumerator.value), true);
                    if (!initializer) {
                        return undefined;
                    }
                    const assignment = ts.factory.createPropertyAssignment(key, initializer);
                    const comment = enumerator['x-enum-description'] || enumerator.description;
                    if (comment) {
                        addLeadingJSDocComment(assignment, [` * ${escapeComment(comment)}`]);
                    }
                    return assignment;
                })
                .filter(isType<ts.PropertyAssignment>),
            true
        );
        nodes = [...nodes, compiler.export.asConst(enumName(config, client, model.name)!, expression)];
    }

    return nodes;
};

const processInterface = processComposition;

const processType = (config: Config, client: Client, model: Model) => {
    let comments: Parameters<typeof compiler.typedef.alias>[3] = [];
    if (model.description || model.deprecated) {
        comments = [
            model.description && ` * ${escapeComment(model.description)}`,
            model.deprecated && ' * @deprecated',
        ];
    }
    return compiler.typedef.alias(model.name, toType(model, config)!, [], comments);
};

const processModel = (config: Config, client: Client, model: Model) => {
    switch (model.export) {
        case 'all-of':
        case 'any-of':
        case 'one-of':
            return processComposition(config, client, model);
        case 'enum':
            return processEnum(config, client, model, true);
        case 'interface':
            return processInterface(config, client, model);
        default:
            return processType(config, client, model);
    }
};

const operationDataType = (config: Config, service: Service) => {
    const operationsWithParameters = service.operations.filter(operation => operation.parameters.length);
    const namespace = `${camelCase(service.name, { pascalCase: true })}Data`;
    const output = `export type ${namespace} = {
        payloads: {
            ${operationsWithParameters
                .map(
                    operation => `${operationKey(operation)}: {
                        ${sortByName(operation.parameters)
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
                                    `${parameter.name + modelIsRequired(config, parameter)}: ${toType(parameter, config)}`,
                                ].join('\n');
                            })
                            .join('\n')}
                        ${
                            config.experimental
                                ? `
                        query${operation.parametersQuery.every(parameter => !parameter.isRequired) ? '?' : ''}: {
                            ${sortByName(operation.parametersQuery)
                                .map(parameter => {
                                    let comment: string[] = [];
                                    if (parameter.description) {
                                        comment = ['/**', ` * ${escapeComment(parameter.description)}`, ' */'];
                                    }
                                    return [
                                        ...comment,
                                        `${parameter.name + modelIsRequired(config, parameter)}: ${toType(parameter, config)}`,
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
        responses: {
            ${service.operations.map(
                operation =>
                    `${operationKey(operation)}: ${
                        !operation.results.length
                            ? 'void'
                            : operation.results.map(result => toType(result, config)).join(' | ')
                    }
                `
            )}
        }
    }`;
    return output;
};

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientModels = async (
    openApi: OpenApi,
    outputPath: string,
    client: Client,
    config: Config
): Promise<void> => {
    const file = new TypeScriptFile();

    for (const model of client.models) {
        const nodes = processModel(config, client, model);
        const n = Array.isArray(nodes) ? nodes : [nodes];
        file.add(...n);
    }

    for (const service of client.services) {
        const operationDataTypes = operationDataType(config, service);
        file.add(operationDataTypes);
    }

    file.write(path.resolve(outputPath, 'models.ts'), '\n\n');
};
