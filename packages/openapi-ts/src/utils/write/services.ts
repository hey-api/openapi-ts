import { writeFileSync } from 'node:fs';
import path from 'node:path';

import camelCase from 'camelcase';

import { TypeScriptFile } from '../../compiler';
import type { OpenApi, Service } from '../../openApi';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { escapeComment } from '../escape';
import type { Templates } from '../handlebars';
import { modelIsRequired } from '../required';
import { sortByName } from '../sort';
import { unique } from '../unique';
import { toType } from './type';

export const operationDataType = (config: Config, service: Service) => {
    const operationsWithParameters = service.operations.filter(operation => operation.parameters.length);
    if (!config.useOptions || !operationsWithParameters.length) {
        return '';
    }
    const namespace = `${camelCase(service.name, { pascalCase: true })}Data`;
    const output = `export type ${namespace} = {
        ${operationsWithParameters
            .map(
                operation => `${camelCase(operation.name, { pascalCase: true })}: {
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
    }`;
    return output;
};

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param config {@link Config} passed to the `createClient()` method
 * @param templates The loaded handlebar templates
 */
export const writeClientServices = async (
    openApi: OpenApi,
    outputPath: string,
    client: Client,
    config: Config,
    templates: Templates
): Promise<void> => {
    if (!client.services.length) {
        return;
    }
    const file = new TypeScriptFile();

    let imports: string[] = [];
    let operationTypes: string[] = [];
    let results: string[] = [];

    for (const service of client.services) {
        const result = templates.exports.service({
            $config: config,
            ...service,
        });
        const operationDataTypes = operationDataType(config, service);
        imports = [...imports, ...service.imports];
        operationTypes = [...operationTypes, operationDataTypes];
        results = [...results, result];
    }

    // Import required packages and core files.
    if (config.client === 'angular') {
        file.addNamedImport('Injectable', '@angular/core');
        if (config.name === undefined) {
            file.addNamedImport('HttpClient', '@angular/common/http');
        }
        file.addNamedImport({ isTypeOnly: true, name: 'Observable' }, 'rxjs');
    } else {
        file.addNamedImport({ isTypeOnly: true, name: 'CancelablePromise' }, './core/CancelablePromise');
    }
    if (config.serviceResponse === 'response') {
        file.addNamedImport({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult');
    }
    if (config.name) {
        file.addNamedImport(
            { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
            './core/BaseHttpRequest'
        );
    } else {
        if (config.useOptions) {
            if (config.serviceResponse === 'generics') {
                file.addNamedImport(['mergeOpenApiConfig', 'OpenAPI'], './core/OpenAPI');
                file.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
                file.addNamedImport(
                    [
                        { isTypeOnly: true, name: 'TApiResponse' },
                        { isTypeOnly: true, name: 'TConfig' },
                        { isTypeOnly: true, name: 'TResult' },
                    ],
                    './core/types'
                );
            } else {
                file.addNamedImport('OpenAPI', './core/OpenAPI');
                file.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
            }
        } else {
            file.addNamedImport('OpenAPI', './core/OpenAPI');
            file.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
        }
    }

    // Import all models required by the services.
    const models = imports.filter(unique).map(imp => ({ isTypeOnly: true, name: imp }));
    file.addNamedImport(models, './models');

    const data = [file.toString(), ...operationTypes, ...results].join('\n\n');

    await writeFileSync(path.resolve(outputPath, 'services.ts'), data);
};
