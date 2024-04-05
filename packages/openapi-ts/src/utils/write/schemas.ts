import { writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { tsNodeToString } from '../../compiler/utils';
import type { Model } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumValue } from '../enum';
import { escapeDescription, escapeNewline, type Templates } from '../handlebars';

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
        let props: ts.PropertyAssignment[] = [];
        props = addObjectProperty(props, 'type', `'${model.base}'`);
        const obj = ts.factory.createObjectLiteralExpression(props, true);
        properties = addObjectProperty(properties, 'contains', obj);
    }

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
};

const compositionSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral(model.export))];

    if (model.description) {
        properties = addObjectProperty(properties, 'description', `\`${escapeDescription(model.description)}\``);
    }

    properties = addObjectProperty(
        properties,
        'contains',
        model.properties.map(property => modelToJsonSchema(config, property))
    );

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
};

const dictSchema = (config: Config, model: Model) => {
    let properties = [ts.factory.createPropertyAssignment('type', ts.factory.createStringLiteral('dictionary'))];

    if (model.link) {
        properties = addObjectProperty(properties, 'contains', modelToJsonSchema(config, model.link));
    } else {
        let props: ts.PropertyAssignment[] = [];
        props = addObjectProperty(props, 'type', `'${model.base}'`);
        const obj = ts.factory.createObjectLiteralExpression(props, true);
        properties = addObjectProperty(properties, 'contains', obj);
    }

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
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

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
};

const genericSchema = (config: Config, model: Model) => {
    let properties: ts.PropertyAssignment[] = [];

    if (model.type) {
        properties = addObjectProperty(properties, 'type', `'${model.type}'`);
    }

    if (model.description) {
        properties = addObjectProperty(properties, 'description', `\`${escapeDescription(model.description)}\``);
    }

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    if (model.format) {
        properties = addObjectProperty(properties, 'format', `'${model.format}'`);
    }

    if (model.maximum !== undefined && model.maximum !== null) {
        properties = addObjectProperty(properties, 'maximum', String(model.maximum));
    }

    if (model.exclusiveMaximum !== undefined && model.exclusiveMaximum !== null) {
        properties = addObjectProperty(properties, 'exclusiveMaximum', String(model.exclusiveMaximum));
    }

    if (model.minimum !== undefined && model.minimum !== null) {
        properties = addObjectProperty(properties, 'minimum', String(model.minimum));
    }

    if (model.exclusiveMinimum !== undefined && model.exclusiveMinimum !== null) {
        properties = addObjectProperty(properties, 'exclusiveMinimum', String(model.exclusiveMinimum));
    }

    if (model.multipleOf !== undefined && model.multipleOf !== null) {
        properties = addObjectProperty(properties, 'multipleOf', String(model.multipleOf));
    }

    if (model.maxLength !== undefined && model.maxLength !== null) {
        properties = addObjectProperty(properties, 'maxLength', String(model.maxLength));
    }

    if (model.minLength !== undefined && model.minLength !== null) {
        properties = addObjectProperty(properties, 'minLength', String(model.minLength));
    }

    if (model.pattern) {
        properties = addObjectProperty(properties, 'pattern', `'${escapeNewline(model.pattern)}'`);
    }

    if (model.maxItems !== undefined && model.maxItems !== null) {
        properties = addObjectProperty(properties, 'maxItems', String(model.maxItems));
    }

    if (model.minItems !== undefined && model.minItems !== null) {
        properties = addObjectProperty(properties, 'minItems', String(model.minItems));
    }

    if (model.uniqueItems !== undefined && model.uniqueItems !== null) {
        properties = addObjectProperty(properties, 'uniqueItems', String(model.uniqueItems));
    }

    if (model.maxProperties !== undefined && model.maxProperties !== null) {
        properties = addObjectProperty(properties, 'maxProperties', String(model.maxProperties));
    }

    if (model.minProperties !== undefined && model.minProperties !== null) {
        properties = addObjectProperty(properties, 'minProperties', String(model.minProperties));
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
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
    const obj = ts.factory.createObjectLiteralExpression(props, true);
    properties = addObjectProperty(properties, 'properties', obj);

    if (model.default !== undefined) {
        properties = addObjectProperty(properties, 'default', String(model.default));
    }

    if (model.isReadOnly) {
        properties = addObjectProperty(properties, 'isReadOnly', 'true');
    }

    if (model.isRequired) {
        properties = addObjectProperty(properties, 'isRequired', 'true');
    }

    if (model.isNullable) {
        properties = addObjectProperty(properties, 'isNullable', 'true');
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
};

const modelToJsonSchema = (config: Config, model: Model) => {
    switch (model.export) {
        case 'all-of':
        case 'any-of':
        case 'one-of':
            return compositionSchema(config, model);
        case 'array':
            return arraySchema(config, model);
        case 'dictionary':
            return dictSchema(config, model);
        case 'enum':
            return enumSchema(config, model);
        case 'interface':
            return interfaceSchema(config, model);
        default:
            return genericSchema(config, model);
    }
};

const exportSchema = (config: Config, model: Model) => {
    const jsonSchema = modelToJsonSchema(config, model);
    const statement = ts.factory.createVariableStatement(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier(`$${model.name}`),
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
        const result = exportSchema(config, model);
        results = [...results, result];
    }

    await writeFileSync(path.resolve(outputPath, 'schemas.ts'), results.join('\n\n'));
};
