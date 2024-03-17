import { sync } from 'cross-spawn';
import { createRequire } from 'module';
import Path from 'path';

import type { Client } from '../../client/interfaces/Client';
import type { Options } from '../../client/interfaces/Options';
import { mkdir, rmdir } from '../fileSystem';
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
    options: Omit<Required<Options>, 'base' | 'clientName' | 'request'> &
        Pick<Options, 'base' | 'clientName' | 'request'>
): Promise<void> => {
    const outputPath = Path.resolve(process.cwd(), options.output);

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
        const outputPathCore = Path.resolve(outputPath, 'core');
        await rmdir(outputPathCore);
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, options);
    }

    if (options.exportServices) {
        const outputPathServices = Path.resolve(outputPath, 'services');
        await rmdir(outputPathServices);
        await mkdir(outputPathServices);
        await writeClientServices(client, templates, outputPathServices, options);
    }

    if (options.exportSchemas) {
        const outputPathSchemas = Path.resolve(outputPath, 'schemas');
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client, templates, outputPathSchemas, options);
    }

    if (options.exportModels) {
        const outputPathModels = Path.resolve(outputPath, 'models');
        await rmdir(outputPathModels);
        await mkdir(outputPathModels);
        await writeClientModels(client, templates, outputPathModels, options);
    }

    if (options.clientName) {
        await mkdir(outputPath);
        await writeClientClass(client, templates, outputPath, {
            ...options,
            clientName: options.clientName,
        });
    }

    if (options.exportCore || options.exportServices || options.exportSchemas || options.exportModels) {
        await mkdir(outputPath);
        await writeClientIndex(client, templates, outputPath, options);
    }

    const pathPackageJson = Path.resolve(process.cwd(), 'package.json');
    const require = createRequire('/');
    const json = require(pathPackageJson);

    const allDependencies = [json.dependencies, json.devDependencies].reduce(
        (res, deps) => ({
            ...res,
            ...deps,
        }),
        {}
    );

    if (options.autoformat) {
        if (allDependencies.prettier) {
            sync('prettier', ['--ignore-unknown', options.output, '--write', '--ignore-path', './.prettierignore']);
        }
    }
};
