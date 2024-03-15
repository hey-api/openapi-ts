import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import Path from 'path';

import type { Client } from '../client/interfaces/Client';
import type { Options } from '../client/interfaces/Options';
import { mkdir, rmdir } from './fileSystem';
import { isSubDirectory } from './isSubdirectory';
import type { Templates } from './registerHandlebarTemplates';
import { writeClientClass } from './writeClientClass';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';

/**
 * Write our OpenAPI client, using the given templates at the given output
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param options Options passed to the `generate()` function
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    options: Pick<
        Required<Options>,
        | 'exportCore'
        | 'exportModels'
        | 'exportSchemas'
        | 'exportServices'
        | 'httpClient'
        | 'indent'
        | 'output'
        | 'postfixModels'
        | 'postfixServices'
        | 'serviceResponse'
        | 'useDateType'
        | 'useOptions'
    > &
        Omit<
            Options,
            | 'exportCore'
            | 'exportModels'
            | 'exportSchemas'
            | 'exportServices'
            | 'httpClient'
            | 'indent'
            | 'output'
            | 'postfixModels'
            | 'postfixServices'
            | 'serviceResponse'
            | 'useDateType'
            | 'useOptions'
        >
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
        await writeClientServices(client.services, templates, outputPathServices, options);
    }

    if (options.exportSchemas) {
        const outputPathSchemas = Path.resolve(outputPath, 'schemas');
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, options.httpClient, options.indent);
    }

    if (options.exportModels) {
        const outputPathModels = Path.resolve(outputPath, 'models');
        await rmdir(outputPathModels);
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels, options);
    }

    if (options.clientName) {
        await mkdir(outputPath);
        await writeClientClass(
            client,
            templates,
            outputPath,
            options.httpClient,
            options.clientName,
            options.indent,
            options.postfixServices
        );
    }

    if (options.exportCore || options.exportServices || options.exportSchemas || options.exportModels) {
        await mkdir(outputPath);
        await writeClientIndex(
            client,
            templates,
            outputPath,
            options.exportCore,
            options.exportServices,
            options.exportModels,
            options.exportSchemas,
            options.postfixServices,
            options.postfixModels,
            options.clientName
        );
    }

    if (options.autoformat) {
        const pathPackageJson = Path.resolve(process.cwd(), 'package.json');
        const require = createRequire('/');
        const json = require(pathPackageJson);
        const usesPrettier = [json.dependencies, json.devDependencies].some(deps => Boolean(deps.prettier));
        if (usesPrettier) {
            spawnSync('prettier', ['--ignore-unknown', '--write', options.output]);
        }
    }
};
