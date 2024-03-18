import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../client/interfaces/Client';
import type { Config } from '../../node';
import { isSubDirectory } from '../isSubdirectory';
import type { Templates } from '../registerHandlebarTemplates';
import { writeClientClass } from './class';
import { writeClientCore } from './core';
import { writeClientIndex } from './index';
import { writeClientModels } from './models';
import { writeClientSchemas } from './schemas';
import { writeClientServices } from './services';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client containing models, schemas, and services
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param options Options passed to the `generate()` function
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    options: Omit<Required<Config>, 'base' | 'clientName' | 'request'> & Pick<Config, 'base' | 'clientName' | 'request'>
): Promise<void> => {
    const outputPath = path.resolve(process.cwd(), options.output);

    if (!isSubDirectory(process.cwd(), options.output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    if (typeof options.exportServices === 'string') {
        const regexp = new RegExp(options.exportServices);
        client.services = client.services.filter(service => regexp.test(service.name));
    }

    if (typeof options.exportModels === 'string') {
        const regexp = new RegExp(options.exportModels);
        client.models = client.models.filter(model => regexp.test(model.name));
    }

    if (options.exportCore) {
        const outputPathCore = path.resolve(outputPath, 'core');
        await rmSync(outputPathCore, {
            force: true,
            recursive: true,
        });
        await mkdirSync(outputPathCore, {
            recursive: true,
        });
        await writeClientCore(client, templates, outputPathCore, options);
    }

    if (options.exportServices) {
        const outputPathServices = path.resolve(outputPath, 'services');
        await rmSync(outputPathServices, {
            force: true,
            recursive: true,
        });
        await mkdirSync(outputPathServices, {
            recursive: true,
        });
        await writeClientServices(client, templates, outputPathServices, options);
    }

    if (options.exportSchemas) {
        const outputPathSchemas = path.resolve(outputPath, 'schemas');
        await rmSync(outputPathSchemas, {
            force: true,
            recursive: true,
        });
        await mkdirSync(outputPathSchemas, {
            recursive: true,
        });
        await writeClientSchemas(client, templates, outputPathSchemas, options);
    }

    if (options.exportModels) {
        const outputPathModels = path.resolve(outputPath, 'models');
        await rmSync(outputPathModels, {
            force: true,
            recursive: true,
        });
        await mkdirSync(outputPathModels, {
            recursive: true,
        });
        await writeClientModels(client, templates, outputPathModels, options);
    }

    if (options.clientName) {
        await mkdirSync(outputPath, {
            recursive: true,
        });
        await writeClientClass(client, templates, outputPath, {
            ...options,
            clientName: options.clientName,
        });
    }

    if (options.exportCore || options.exportServices || options.exportSchemas || options.exportModels) {
        await mkdirSync(outputPath, {
            recursive: true,
        });
        await writeClientIndex(client, templates, outputPath, options);
    }
};
