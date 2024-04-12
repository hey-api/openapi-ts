import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import type { Templates } from '../handlebars';
import { writeClientClass } from './class';
import { writeCore } from './core';
import { writeClientIndex } from './index';
import { writeTypesAndEnums } from './models';
import { writeSchemas } from './schemas';
import { writeServices } from './services';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param client Client containing models, schemas, and services
 * @param templates Templates wrapper with all loaded Handlebars templates
 */
export const writeClient = async (openApi: OpenApi, client: Client, templates: Templates): Promise<void> => {
    const config = getConfig();

    if (typeof config.exportServices === 'string') {
        const regexp = new RegExp(config.exportServices);
        client.services = client.services.filter(service => regexp.test(service.name));
    }

    if (typeof config.exportModels === 'string') {
        const regexp = new RegExp(config.exportModels);
        client.models = client.models.filter(model => regexp.test(model.name));
    }

    if (!existsSync(path.resolve(config.output))) {
        mkdirSync(path.resolve(config.output), { recursive: true });
    }

    const sections = [
        {
            dir: 'core',
            fn: writeCore,
        },
        {
            dir: '',
            fn: writeSchemas,
        },
        {
            dir: '',
            fn: writeTypesAndEnums,
        },
        {
            dir: '',
            fn: writeServices,
        },
        {
            dir: '',
            fn: writeClientClass,
        },
    ] as const;

    for (const section of sections) {
        const sectionPath = path.resolve(config.output, section.dir);
        await section.fn(openApi, sectionPath, client, templates);
    }

    await writeClientIndex(client, config.output);
};
