import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import compiler from '../../compiler';
import { toExpression } from '../../compiler/types';
import { isType, ots, tsNodeToString } from '../../compiler/utils';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumKey, enumName, enumValue } from '../enum';
import { escapeComment } from '../escape';
import type { Templates } from '../handlebars';
import { toType } from './type';

const processEnum = (config: Config, client: Client, model: Model, exportType: boolean) => {
    let nodes: Array<ts.JSDoc | ts.TypeAliasDeclaration | ts.Identifier | ts.VariableStatement> = [];
    if (exportType) {
        // {{#if exportType}}
        // {{#ifdef description deprecated}}
        // /**
        // {{#if description}}
        // * {{{escapeComment description}}}
        // {{/if}}
        // {{#if deprecated}}
        // * @deprecated
        // {{/if}}
        // */
        // {{/ifdef}}
        // {{#equals @root.$config.enums 'typescript'}}
        // export enum {{{name}}} {
        //     {{#each enum}}
        //     {{#if x-enum-description}}
        //     /**
        //      * {{{escapeComment x-enum-description}}}
        //      */
        //     {{else if description}}
        //     /**
        //      * {{{escapeComment description}}}
        //      */
        //     {{/if}}
        //     {{{enumKey value x-enum-varname}}} = {{{enumValue value}}},
        //     {{/each}}
        // }
        // {{else}}
        // export type {{{name}}} = {{{enumUnionType enum}}};
        // {{/equals}}
        // {{/if}}
        if (model.description || model.deprecated) {
            // TODO: figure out deprecated
            // {{#if deprecated}}
            //  * @deprecated
            // {{/if}}
            const comment = ts.factory.createJSDocComment(
                model.description
                    ? ts.factory.createJSDocText(escapeComment(model.description, false)).text
                    : undefined,
                [
                    // ts.factory.createJSDocTypedefTag(
                    //     undefined,
                    //     undefined,
                    //     ts.factory.createIdentifier('{Object}'),
                    //     'key2 - description or deprecated'
                    // ),
                    // ots.string('foo'),
                    // ts.factory.createJSDocText('bar').text,
                    // ts.factory.createIdentifier('fooo'),
                    // ts.factory.createJSDocDeprecatedTag(ts.SyntaxKind.JSDoc),
                ]
            );
            const commentTrailingNewLine = ts.factory.createIdentifier('\n');
            nodes = [...nodes, comment, commentTrailingNewLine];
        }
    }

    if (config.enums === 'javascript') {
        const expression = ts.factory.createObjectLiteralExpression(
            model.enum
                .map(enumerator => {
                    const key = enumKey(enumerator.value, enumerator['x-enum-varname']);
                    const initializer = toExpression(enumValue(enumerator.value));
                    if (!initializer) {
                        return undefined;
                    }
                    const assignment = ts.factory.createPropertyAssignment(key, initializer);
                    const comment = enumerator['x-enum-description'] || enumerator.description;
                    if (!comment) {
                        return assignment;
                    }
                    return ts.addSyntheticLeadingComment(
                        assignment,
                        ts.SyntaxKind.MultiLineCommentTrivia,
                        `*\n * ${escapeComment(comment)}\n `,
                        true
                    );
                })
                .filter(isType<ts.PropertyAssignment>),
            true
        );
        nodes = [...nodes, compiler.export.asConst(enumName(config, client, model.name)!, expression)];
    }

    return nodes;
};

const processType = (config: Config, client: Client, model: Model) => {
    let nodes: Array<ts.JSDoc | ts.TypeAliasDeclaration | ts.Identifier | ts.VariableStatement> = [];
    if (model.description || model.deprecated) {
        // TODO: figure out deprecated
        // {{#if deprecated}}
        //  * @deprecated
        // {{/if}}
        const comment = ts.factory.createJSDocComment(
            model.description ? ts.factory.createJSDocText(escapeComment(model.description, false)).text : undefined,
            [
                // ts.factory.createJSDocTypedefTag(
                //     undefined,
                //     undefined,
                //     ts.factory.createIdentifier('{Object}'),
                //     'key2 - description or deprecated'
                // ),
                // ots.string('foo'),
                // ts.factory.createJSDocText('bar').text,
                // ts.factory.createIdentifier('fooo'),
                // ts.factory.createJSDocDeprecatedTag(ts.SyntaxKind.JSDoc),
            ]
        );
        const commentTrailingNewLine = ts.factory.createIdentifier('\n');
        nodes = [...nodes, comment, commentTrailingNewLine];
    }

    const typeDeclaration = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(model.name),
        undefined,
        ts.factory.createTypeReferenceNode(toType(model, config)!)
    );
    nodes = [...nodes, typeDeclaration];

    return nodes;
};

const processModel = (config: Config, client: Client, model: Model) => {
    const typeDeclaration = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(`${model.name}_WIP`),
        undefined,
        ts.factory.createTypeReferenceNode('string')
    );

    const comment = ts.factory.createJSDocComment(ts.factory.createJSDocText('bar').text, [
        ts.factory.createJSDocTypedefTag(
            undefined,
            undefined,
            ts.factory.createIdentifier('{Object}'),
            'key2 - Description for key2.'
        ),
    ]);
    const commentTrailingNewLine = ts.factory.createIdentifier('\n');

    switch (model.export) {
        case 'all-of':
        case 'any-of':
        case 'one-of':
            // {{>exportComposition}}
            // return compositionSchema(config, model);
            return [comment, commentTrailingNewLine, typeDeclaration];
        case 'enum':
            return processEnum(config, client, model, true);
        case 'interface':
            // {{>exportInterface}}
            // return interfaceSchema(config, model);
            return [comment, commentTrailingNewLine, typeDeclaration];
        default:
            return processType(config, client, model);
    }
};

const exportModel = (config: Config, client: Client, model: Model) => {
    const expression = processModel(config, client, model);
    let result: string = '';
    for (const e of expression) {
        result += tsNodeToString(e);
    }
    return result;
};

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientModels = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
): Promise<void> => {
    if (!client.models.length) {
        return;
    }

    // TODO: replace array of strings with array of TS nodes, handle double newlines
    // between them with Compiler, print to string only once.
    let results: string[] = [];

    for (const model of client.models) {
        const result = exportModel(config, client, model);
        const resultOld = templates.exports.model({
            $config: config,
            ...model,
        });
        results = [...results, result, resultOld];
    }

    writeFileSync(path.resolve(outputPath, 'models.ts'), results.join('\n\n'));
};
