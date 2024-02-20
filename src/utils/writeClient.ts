import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import type { Options } from '../client/interfaces/Options';
import type { HttpClient } from '../HttpClient';
import type { Indent } from '../Indent';
import { mkdir, rmdir } from './fileSystem';
import { isDefined } from './isDefined';
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
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param clientName Custom client class name
 * @param request Path to custom request file
 */
export const writeClient = async (
    client: Client,
    templates: Templates,
    output: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean | string,
    exportModels: boolean | string,
    exportSchemas: boolean,
    indent: Indent,
    postfixServices: string,
    postfixModels: string,
    options: Options
): Promise<void> => {
    const outputPath = resolve(process.cwd(), output);
    const outputPathCore = resolve(outputPath, 'core');
    const outputPathModels = resolve(outputPath, 'models');
    const outputPathSchemas = resolve(outputPath, 'schemas');
    const outputPathServices = resolve(outputPath, 'services');

    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    if (typeof exportServices === 'string') {
        const regexp = new RegExp(exportServices);
        client.services = client.services.filter(service => regexp.test(service.name));
    }

    if (typeof exportModels === 'string') {
        const regexp = new RegExp(exportModels);
        client.models = client.models.filter(model => regexp.test(model.name));
    }

    if (exportCore) {
        await rmdir(outputPathCore);
        await mkdir(outputPathCore);
        await writeClientCore(
            client,
            templates,
            outputPathCore,
            httpClient,
            indent,
            options.clientName,
            options.request
        );
    }

    if (exportServices) {
        await rmdir(outputPathServices);
        await mkdir(outputPathServices);
        await writeClientServices(
            client.services,
            templates,
            outputPathServices,
            httpClient,
            useUnionTypes,
            useOptions,
            indent,
            postfixServices,
            options.clientName
        );
    }

    if (exportSchemas) {
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, httpClient, useUnionTypes, indent);
    }

    if (exportModels) {
        await rmdir(outputPathModels);
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels, httpClient, useUnionTypes, indent);
    }

    if (isDefined(options.clientName)) {
        await mkdir(outputPath);
        await writeClientClass(client, templates, outputPath, httpClient, options.clientName, indent, postfixServices);
    }

    if (exportCore || exportServices || exportSchemas || exportModels) {
        await mkdir(outputPath);
        await writeClientIndex(
            client,
            templates,
            outputPath,
            useUnionTypes,
            exportCore,
            exportServices,
            exportModels,
            exportSchemas,
            postfixServices,
            postfixModels,
            options.clientName
        );
    }

    if (options.autoformat) {
        const pathPackageJson = resolve(process.cwd(), 'package.json');
        const require = createRequire('/');
        const json = require(pathPackageJson);
        const usesPrettier = [json.dependencies, json.devDependencies].some(deps => Boolean(deps.prettier));
        if (usesPrettier) {
            spawnSync('prettier', ['--ignore-unknown', '--write', output]);
        }
    }
};
