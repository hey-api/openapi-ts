import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import type { Templates } from '../handlebars';
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
    // Dont create empty file
    if (client.services.length === 0) {
        return;
    }
    // Generate a file with all services.
    const results: string[] = [];
    const imports: string[] = [];
    for (const service of client.services) {
        const result = templates.exports.service({
            $config: config,
            ...service,
        });
        imports.push(...service.imports);
        results.push(result);
    }
    // Import all models required by the services.
    const uniqueImports = imports.filter(unique);
    if (uniqueImports.length > 0) {
        const importString = `import type { ${uniqueImports.join(',')} } from './models';`;
        results.unshift(importString);
    }
    // Import required packages and core files.
    const imports2: string[] = [];
    if (config.client === 'angular') {
        imports2.push(`import { Injectable } from '@angular/core';`);
        if (config.name === undefined) {
            imports2.push(`import { HttpClient } from '@angular/common/http';`);
        }
        imports2.push(`import type { Observable } from 'rxjs';`);
    } else {
        imports2.push(`import type { CancelablePromise } from './core/CancelablePromise';`);
    }
    if (config.serviceResponse === 'response') {
        imports2.push(`import type { ApiResult } from './core/ApiResult;`);
    }
    if (config.name) {
        if (config.client === 'angular') {
            imports2.push(`import { BaseHttpRequest } from './core/BaseHttpRequest';`);
        } else {
            imports2.push(`import type { BaseHttpRequest } from './core/BaseHttpRequest';`);
        }
    } else {
        if (config.useOptions) {
            if (config.serviceResponse === 'generics') {
                imports2.push(`import { mergeOpenApiConfig, OpenAPI } from './core/OpenAPI';`);
                imports2.push(`import { request as __request } from './core/request';`);
                imports2.push(`import type { TApiResponse, TConfig, TResult } from './core/types';`);
            } else {
                imports2.push(`import { OpenAPI } from './core/OpenAPI';`);
                imports2.push(`import { request as __request } from './core/request';`);
            }
        } else {
            imports2.push(`import { OpenAPI } from './core/OpenAPI';`);
            imports2.push(`import { request as __request } from './core/request';`);
        }
    }
    results.unshift(imports2.join('\n'));
    // Generate index file exporting all generated service files.
    const file = path.resolve(outputPath, 'services.ts');
    await writeFileSync(file, results.join('\n\n'));
};
