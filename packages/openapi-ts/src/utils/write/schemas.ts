import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumValue } from '../enum';
import type { Templates } from '../handlebars';

const enumSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('Enum'))];

    if (model.enum.length) {
        const property = ts.factory.createPropertyAssignment(
            'enum',
            ts.factory.createArrayLiteralExpression(
                model.enum.map(enumerator => ts.factory.createIdentifier(enumValue(enumerator.value)!))
            )
        );
        properties = [...properties, property];
    }

    if (model.default !== undefined) {
        const value = ts.factory.createIdentifier(String(model.default));
        const property = ts.factory.createPropertyAssignment('default', value);
        properties = [...properties, property];
    }

    if (model.isReadOnly) {
        const property = ts.factory.createPropertyAssignment('isReadOnly', ts.factory.createStringLiteral('true'));
        properties = [...properties, property];
    }
    if (model.isRequired) {
        const property = ts.factory.createPropertyAssignment('isRequired', ts.factory.createStringLiteral('true'));
        properties = [...properties, property];
    }
    if (model.isNullable) {
        const property = ts.factory.createPropertyAssignment('isNullable', ts.factory.createStringLiteral('true'));
        properties = [...properties, property];
    }

    return ts.factory.createObjectLiteralExpression(properties);
};

const exportSchema = (config: Config, model: Model) => {
    const file = ts.createSourceFile('', '', ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    let jsonSchema = ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment('firstKey', ts.factory.createStringLiteral('string expression')),
        ts.factory.createPropertyAssignment('secondKey', ts.factory.createNumericLiteral(0)),
    ]);

    let schema = '';
    switch (model.export) {
        case 'all-of':
        case 'any-of':
        case 'one-of':
            // {{>schemaComposition}}
            schema = 'COMP';
            break;
        case 'array':
            // {{>schemaArray}}
            schema = 'ARR';
            break;
        case 'dictionary':
            // {{>schemaDictionary}}
            schema = 'DICT';
            break;
        case 'enum':
            jsonSchema = enumSchema(config, model);
            break;
        case 'interface':
            // {{>schemaInterface}}
            schema = 'INTERFACE';
            break;
        default:
            // {{>schemaGeneric}}
            schema = 'GENERIC';
            break;
    }

    const statement = ts.factory.createVariableStatement(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier(`$${model.name}_WIP`),
                    undefined,
                    undefined,
                    ts.factory.createAsExpression(jsonSchema, ts.factory.createTypeReferenceNode('const'))
                ),
            ],
            ts.NodeFlags.Const
        )
    );

    return printer.printNode(ts.EmitHint.Unspecified, statement, file);
};

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientSchemas = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
): Promise<void> => {
    if (!client.models.length) {
        return;
    }

    let results: string[] = [];

    for (const model of client.models) {
        const resultNew = exportSchema(config, model);
        const result = templates.exports.schema({
            $config: config,
            ...model,
        });
        results = [...results, resultNew, result];
    }

    await writeFileSync(path.resolve(outputPath, 'schemas.ts'), results.join('\n\n'));
};
