import { writeFileSync } from 'node:fs';
import path from 'node:path';

import compiler, { TypeScriptFile } from '../../compiler';
import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { operationDataType, type Templates } from '../handlebars';
import { unique } from '../unique';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientServices = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
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
        file.push(compiler.import.named('Injectable', '@angular/core'));
        if (config.name === undefined) {
            file.push(compiler.import.named('HttpClient', '@angular/common/http'));
        }
        file.push(compiler.import.named({ isTypeOnly: true, name: 'Observable' }, 'rxjs'));
    } else {
        file.push(compiler.import.named({ isTypeOnly: true, name: 'CancelablePromise' }, './core/CancelablePromise'));
    }
    if (config.serviceResponse === 'response') {
        file.push(compiler.import.named({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult'));
    }
    if (config.name) {
        file.push(
            compiler.import.named(
                { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
                './core/BaseHttpRequest'
            )
        );
    } else {
        if (config.useOptions) {
            if (config.serviceResponse === 'generics') {
                file.push(compiler.import.named(['mergeOpenApiConfig', 'OpenAPI'], './core/OpenAPI'));
                file.push(compiler.import.named({ alias: '__request', name: 'request' }, './core/request'));
                file.push(
                    compiler.import.named(
                        [
                            { isTypeOnly: true, name: 'TApiResponse' },
                            { isTypeOnly: true, name: 'TConfig' },
                            { isTypeOnly: true, name: 'TResult' },
                        ],
                        './core/types'
                    )
                );
            } else {
                file.push(compiler.import.named('OpenAPI', './core/OpenAPI'));
                file.push(compiler.import.named({ alias: '__request', name: 'request' }, './core/request'));
            }
        } else {
            file.push(compiler.import.named('OpenAPI', './core/OpenAPI'));
            file.push(compiler.import.named({ alias: '__request', name: 'request' }, './core/request'));
        }
    }

    // Import all models required by the services.
    const models = imports.filter(unique).map(imp => ({ isTypeOnly: true, name: imp }));
    file.push(compiler.import.named(models, './models'));

    const data = [file.toString(), ...operationTypes, ...results].join('\n\n');

    await writeFileSync(path.resolve(outputPath, 'services.ts'), data);
};
