import path from 'node:path';

import { type Comments, compiler, type Node, TypeScriptFile } from '../../compiler';
import type { Model, OpenApi, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { enumKey, enumName, enumUnionType, enumValue } from '../enum';
import { escapeComment } from '../escape';
import { operationKey, serviceExportedNamespace } from '../handlebars';
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

const processServiceTypes = (service: Service) => {
    const config = getConfig();
    const operationsWithParameters = service.operations.filter(operation => operation.parameters.length);
    let properties: Model[] = [];

    if (operationsWithParameters.length) {
        const requests: Model[] = operationsWithParameters.map(operation => {
            let parameters: Model[] = sortByName([...operation.parameters]).filter(parameter => !config.experimental || parameter.in !== 'query')

            if (config.experimental) {
                const queryParameters: Model[] = sortByName([...operation.parametersQuery])
                const query: Model = {
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
                    isRequired: operation.parametersQuery.some(parameter => parameter.isRequired),
                    link: null,
                    name: '',
                    properties: queryParameters,
                    template: null,
                    type: ''
                }
                parameters = [...parameters, query]
            }

            const op: Model = {
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
                name: operationKey(operation),
                properties: parameters,
                template: null,
                type: ''
            }
            return op
        })
        properties = [...properties, {
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
            name: 'req',
            properties: requests,
            template: null,
            type: ''
        }]
    }

    if (service.operations.length) {
        const responses: Model[] = service.operations.map(operation => {
            const op: Model = {
                $refs: [],
                base: !operation.results.length ? 'void' : operation.results.map(result => toType(result)).join(' | '),
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
                name: operationKey(operation),
                properties: [],
                template: null,
                type: ''
            }
            return op
        })
        properties = [...properties, {
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
            name: 'res',
            properties: responses,
            template: null,
            type: ''
        }]
    }

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
        type: ''
    });
    const namespace = serviceExportedNamespace(service);
    return compiler.typedef.alias(namespace, type!)
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
        const serviceTypes = processServiceTypes(service);
        file.add(serviceTypes);
    }

    file.write(path.resolve(outputPath, 'models.ts'), '\n\n');
};
