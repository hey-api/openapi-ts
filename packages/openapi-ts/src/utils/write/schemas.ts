import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { tsNodeToString } from '../../compiler/utils';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumValue } from '../enum';
import { escapeDescription, type Templates } from '../handlebars';

const valueToIdentifier = (value: string | ts.ObjectLiteralExpression) => {
    if (typeof value !== 'string') {
        return value;
    }
    return ts.factory.createIdentifier(value);
};

const addObjectProperty = (
    properties: ts.PropertyAssignment[],
    name: string,
    value: string | string[] | ts.ObjectLiteralExpression | ts.ObjectLiteralExpression[]
) => {
    const initializer = Array.isArray(value)
        ? ts.factory.createArrayLiteralExpression(value.map(v => valueToIdentifier(v)))
        : valueToIdentifier(value);
    const property = ts.factory.createPropertyAssignment(name, initializer);
    return [...properties, property];
};

const arraySchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('array'))];

    if (model.link) {
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

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties);
};

const compositionSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral(model.export))];

    if (model.description) {
        properties = addObjectProperty(properties, 'description', `\`${escapeDescription(model.description)}\``);
    }

    if (model.properties.length) {
        properties = addObjectProperty(
            properties,
            'contains',
            model.properties.map(property => modelToJsonSchema(config, property))
        );
    }

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties);
};

const dictSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('dictionary'))];

    if (model.link) {
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

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

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

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties);
};

const interfaceSchema = (config: Config, model: Model) => {
    let properties: ts.PropertyAssignment[] = [];

    if (model.description) {
        properties = addObjectProperty(properties, 'description', `\`${escapeDescription(model.description)}\``);
    }

    let props: ts.PropertyAssignment[] = [];
    model.properties
        .filter(property => property.name !== '[key: string]')
        .forEach(property => {
            props = addObjectProperty(props, property.name, modelToJsonSchema(config, property));
        });
    const obj = ts.factory.createObjectLiteralExpression(props);
    properties = addObjectProperty(properties, 'properties', obj);

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

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
            jsonSchema = compositionSchema(config, model);
            break;
        case 'array':
            jsonSchema = arraySchema(config, model);
            break;
        case 'dictionary':
            jsonSchema = dictSchema(config, model);
            break;
        case 'enum':
            jsonSchema = enumSchema(config, model);
            break;
        case 'interface':
            jsonSchema = interfaceSchema(config, model);
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
