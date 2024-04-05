import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { tsNodeToString } from '../../compiler/utils';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumValue } from '../enum';
import type { Templates } from '../handlebars';

const stringToInitializer = (value: string | string[]) => {
    const initializer = Array.isArray(value)
        ? ts.factory.createArrayLiteralExpression(value.map(v => ts.factory.createIdentifier(v)))
        : ts.factory.createIdentifier(value);
    return initializer;
};

const addObjectProperty = (
    properties: ts.PropertyAssignment[],
    name: string,
    value: string | string[] | ts.ObjectLiteralExpression
) => {
    const initializer = !Array.isArray(value) && typeof value === 'object' ? value : stringToInitializer(value);
    const property = ts.factory.createPropertyAssignment(name, initializer);
    return [...properties, property];
};

const addPropDefault = (model: Model, properties: ts.PropertyAssignment[]) => {
    if (model.default === undefined) {
        return properties;
    }
    return addObjectProperty(properties, 'default', String(model.default));
};

const addPropIsNullable = (model: Model, properties: ts.PropertyAssignment[]) => {
    if (!model.isNullable) {
        return properties;
    }
    return addObjectProperty(properties, 'isNullable', 'true');
};

const addPropIsReadOnly = (model: Model, properties: ts.PropertyAssignment[]) => {
    if (!model.isReadOnly) {
        return properties;
    }
    return addObjectProperty(properties, 'isReadOnly', 'true');
};

const addPropIsRequired = (model: Model, properties: ts.PropertyAssignment[]) => {
    if (!model.isRequired) {
        return properties;
    }
    return addObjectProperty(properties, 'isRequired', 'true');
};

const dictSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('dictionary'))];

    if (model.link) {
        // properties = addObjectProperty(properties, 'contains', exportSchema(config, model.link));
        properties = addObjectProperty(properties, 'contains', modelToJsonSchema(config, model.link));
    } else {
        properties = addObjectProperty(
            properties,
            'contains',
            `{
                type: '${model.base}',
            }`
        );
    }

    properties = addPropDefault(model, properties);
    properties = addPropIsNullable(model, properties);
    properties = addPropIsReadOnly(model, properties);
    properties = addPropIsRequired(model, properties);

    return ts.factory.createObjectLiteralExpression(properties);
};

const enumSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('Enum'))];

    if (model.enum.length) {
        properties = addObjectProperty(
            properties,
            'enum',
            model.enum.map(enumerator => enumValue(enumerator.value)!)
        );
    }

    properties = addPropDefault(model, properties);
    properties = addPropIsNullable(model, properties);
    properties = addPropIsReadOnly(model, properties);
    properties = addPropIsRequired(model, properties);

    return ts.factory.createObjectLiteralExpression(properties);
};

const modelToJsonSchema = (config: Config, model: Model) => {
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
            jsonSchema = dictSchema(config, model);
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

    return jsonSchema;
};

const exportSchema = (config: Config, model: Model) => {
    const jsonSchema = modelToJsonSchema(config, model);
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
    return tsNodeToString(statement);
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
