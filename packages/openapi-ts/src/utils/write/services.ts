import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { TypeScriptFile } from '../../compiler';
import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { serviceExportedNamespace, type Templates } from '../handlebars';
import { unique } from '../unique';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 */
export const writeClientServices = async (
    openApi: OpenApi,
    outputPath: string,
    client: Client,
    templates: Templates
): Promise<void> => {
    const config = getConfig();
    const file = new TypeScriptFile();

    let imports: string[] = [];
    let results: string[] = [];

    for (const service of client.services) {
        const result = templates.exports.service({
            $config: config,
            ...service,
        });
        const exported = serviceExportedNamespace();
        imports = [...imports, exported];
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
        file.addNamedImport('OpenAPI', './core/OpenAPI');
        file.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
    }

    // Import all models required by the services.
    const models = imports.filter(unique).map(imp => ({ isTypeOnly: true, name: imp }));
    file.addNamedImport(models, './models');

    const data = [file.toString(), ...results].join('\n\n');

    await writeFileSync(path.resolve(outputPath, 'services.ts'), data);
};
