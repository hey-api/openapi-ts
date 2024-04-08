import path from 'node:path';

import ts from 'typescript';

import compiler, { TypeScriptFile } from '../../compiler';
import { toExpression } from '../../compiler/types';
import { isType } from '../../compiler/utils';
import type { Model, OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { addLeadingJSDocComment, toType } from './type';

type Nodes = Array<ts.JSDoc | ts.TypeAliasDeclaration | ts.Identifier | ts.VariableStatement | ts.EnumDeclaration>;

const processComposition = (config: Config, client: Client, model: Model) => {
    let nodes: Nodes = [
        ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier(model.name),
            undefined,
            ts.factory.createTypeReferenceNode(toType(model, config)!)
        ),
    ];

    if (model.description || model.deprecated) {
        addLeadingJSDocComment(nodes[0], [
            model.description && ` * ${escapeComment(model.description)}`,
            model.deprecated && ' * @deprecated',
        ]);
    }

    model.enums.forEach(enumerator => {
        const result = processEnum(config, client, enumerator, false);
        nodes = [...nodes, ...result];
    });

    return nodes;
};

const processEnum = (config: Config, client: Client, model: Model, exportType: boolean) => {
    let nodes: Nodes = [];

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

const processInterface = (config: Config, client: Client, model: Model) => {
    let nodes: Nodes = [
        ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier(model.name),
            undefined,
            ts.factory.createTypeReferenceNode(toType(model, config)!)
        ),
    ];

    if (model.description || model.deprecated) {
        addLeadingJSDocComment(nodes[0], [
            model.description && ` * ${escapeComment(model.description)}`,
            model.deprecated && ' * @deprecated',
        ]);
    }

    model.enums.forEach(enumerator => {
        const result = processEnum(config, client, enumerator, false);
        nodes = [...nodes, ...result];
    });

    return nodes;
};

const processType = (config: Config, client: Client, model: Model) => {
    const nodes: Nodes = [
        ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier(model.name),
            undefined,
            ts.factory.createTypeReferenceNode(toType(model, config)!)
        ),
    ];

    if (model.description || model.deprecated) {
        addLeadingJSDocComment(nodes[0], [
            model.description && ` * ${escapeComment(model.description)}`,
            model.deprecated && ' * @deprecated',
        ]);
    }

    return nodes;
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
    if (!client.models.length) {
        return;
    }

    const file = new TypeScriptFile();
    for (const model of client.models) {
        const nodes = processModel(config, client, model);
        file.add(...nodes);
    }
    file.write(path.resolve(outputPath, 'models.ts'), '\n\n');
};
