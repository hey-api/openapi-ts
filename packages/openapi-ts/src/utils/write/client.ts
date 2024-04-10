import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import type { Templates } from '../handlebars';
import { writeClientClass } from './class';
import { writeClientCore } from './core';
import { writeClientIndex } from './index';
import { writeClientModels } from './models';
import { writeClientSchemas } from './schemas';
import { writeClientServices } from './services';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param client Client containing models, schemas, and services
 * @param templates Templates wrapper with all loaded Handlebars templates
 */
export const writeClient = async (openApi: OpenApi, client: Client, templates: Templates): Promise<void> => {
    const config = getConfig();
    await rmSync(config.output, {
        force: true,
        recursive: true,
    });

    if (typeof config.exportServices === 'string') {
        const regexp = new RegExp(config.exportServices);
        client.services = client.services.filter(service => regexp.test(service.name));
    }

    if (typeof config.exportModels === 'string') {
        const regexp = new RegExp(config.exportModels);
        client.models = client.models.filter(model => regexp.test(model.name));
    }

    const sections = [
        {
            dir: 'core',
            enabled: config.exportCore,
            fn: writeClientCore,
        },
        {
            dir: '',
            enabled: config.schemas,
            fn: writeClientSchemas,
        },
        {
            dir: '',
            enabled: config.exportModels,
            fn: writeClientModels,
        },
        {
            dir: '',
            enabled: config.exportServices,
            fn: writeClientServices,
        },
        {
            dir: '',
            enabled: config.name,
            fn: writeClientClass,
        },
    ] as const;

    for (const section of sections) {
        if (section.enabled) {
            const sectionPath = path.resolve(config.output, section.dir);
            if (section.dir) {
                await rmSync(sectionPath, {
                    force: true,
                    recursive: true,
                });
            }
            await mkdirSync(sectionPath, {
                recursive: true,
            });
            await section.fn(openApi, sectionPath, client, templates);
        }
    }

    if (sections.some(section => section.enabled)) {
        await writeClientIndex(client, config.output);
    }
};
