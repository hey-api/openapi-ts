import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { tsNodeToString } from '../../compiler/utils';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';

// {{#ifdef description deprecated}}
// /**
// {{#if description}}
//  * {{{escapeComment description}}}
// {{/if}}
// {{#if deprecated}}
//  * @deprecated
// {{/if}}
//  */
// {{/ifdef}}
// export type {{{name}}} = {{>type}};

const modelToTypeScriptInterface = (config: Config, model: Model) => {
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
            // {{>exportEnum exportType="true"}}
            // return enumSchema(config, model);
            return [comment, commentTrailingNewLine, typeDeclaration];
        case 'interface':
            // {{>exportInterface}}
            // return interfaceSchema(config, model);
            return [comment, commentTrailingNewLine, typeDeclaration];
        default:
            // {{>exportType}}
            // return genericSchema(config, model);
            return [comment, commentTrailingNewLine, typeDeclaration];
    }
};

const exportModel = (config: Config, model: Model) => {
    const expression = modelToTypeScriptInterface(config, model);
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
        const result = exportModel(config, model);
        const resultOld = templates.exports.model({
            $config: config,
            ...model,
        });
        results = [...results, result, resultOld];
    }

    writeFileSync(path.resolve(outputPath, 'models.ts'), results.join('\n\n'));
};
