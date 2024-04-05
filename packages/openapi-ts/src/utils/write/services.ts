import { writeFileSync } from 'node:fs';
import path from 'node:path';

import compiler from '../../compiler';
import { tsNodeToString } from '../../compiler/utils';
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
    const coreImports: string[] = [];
    if (config.client === 'angular') {
        coreImports.push(tsNodeToString(compiler.import.named('Injectable', '@angular/core')));
        if (config.name === undefined) {
            coreImports.push(tsNodeToString(compiler.import.named('HttpClient', '@angular/common/http')));
        }
        coreImports.push(tsNodeToString(compiler.import.named({ isTypeOnly: true, name: 'Observable' }, 'rxjs')));
    } else {
        coreImports.push(
            tsNodeToString(
                compiler.import.named({ isTypeOnly: true, name: 'CancelablePromise' }, './core/CancelablePromise')
            )
        );
    }
    if (config.serviceResponse === 'response') {
        coreImports.push(
            tsNodeToString(compiler.import.named({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult'))
        );
    }
    if (config.name) {
        coreImports.push(
            tsNodeToString(
                compiler.import.named(
                    { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
                    './core/BaseHttpRequest'
                )
            )
        );
    } else {
        if (config.useOptions) {
            if (config.serviceResponse === 'generics') {
                coreImports.push(`import { mergeOpenApiConfig, OpenAPI } from './core/OpenAPI';`);
                coreImports.push(`import { request as __request } from './core/request';`);
                coreImports.push(`import type { TApiResponse, TConfig, TResult } from './core/types';`);
            } else {
                coreImports.push(`import { OpenAPI } from './core/OpenAPI';`);
                coreImports.push(`import { request as __request } from './core/request';`);
            }
        } else {
            coreImports.push(`import { OpenAPI } from './core/OpenAPI';`);
            coreImports.push(`import { request as __request } from './core/request';`);
        }
    }

    // Import all models required by the services.
    let modelImportsString = '';
    const uniqueImports = imports.filter(unique);
    if (uniqueImports.length) {
        modelImportsString = `import type { ${uniqueImports.join(',')} } from './models';`;
    }

    const data = [coreImports.join('\n'), modelImportsString, ...operationTypes, ...results].join('\n\n');

    await writeFileSync(path.resolve(outputPath, 'services.ts'), data);
};
