import type { Options } from './client/interfaces/Options';
import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { parse as parseV2 } from './openApi/v2';
import { parse as parseV3 } from './openApi/v3';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiVersion, OpenApiVersion } from './utils/getOpenApiVersion';
import { isString } from './utils/isString';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param input The relative location of the OpenAPI spec
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr, node or axios)
 * @param clientName Custom client class name
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param autoformat Process generated files with autoformatter
 * @param exportCore Generate core client classes
 * @param exportServices Generate services
 * @param exportModels Generate models
 * @param exportSchemas Generate schemas
 * @param useDateType Output Date instead of string for the format "date-time" in the models
 * @param useOperationId should the operationId be used when generating operation names
 * @param indent Indentation options (4, 2 or tab)
 * @param postfixServices Service name postfix
 * @param postfixModels Model name postfix
 * @param request Path to custom request file
 * @param write Write the files to disk (true or false)
 */
export const generate = async (options: Options): Promise<void> => {
    const {
        exportCore = true,
        exportModels = true,
        exportSchemas = false,
        exportServices = true,
        httpClient = HttpClient.FETCH,
        indent = Indent.SPACE_4,
        postfixModels = '',
        postfixServices = 'Service',
        useDateType = false,
        useOptions = false,
        useUnionTypes = false,
        write = true,
    } = options;
    const openApi = isString(options.input) ? await getOpenApiSpec(options.input) : options.input;
    const openApiVersion = getOpenApiVersion(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        useUnionTypes,
        useOptions,
    });

    let parser: typeof parseV2 | typeof parseV3;

    switch (openApiVersion) {
        case OpenApiVersion.V2: {
            parser = parseV2;
            break;
        }

        case OpenApiVersion.V3: {
            parser = parseV3;
            break;
        }
    }

    if (!parser) {
        return;
    }

    const client = parser(openApi, options);
    const clientFinal = postProcessClient(client);
    if (write) {
        await writeClient(clientFinal, templates, {
            ...options,
            exportCore,
            exportModels,
            exportSchemas,
            exportServices,
            httpClient,
            indent,
            postfixModels,
            postfixServices,
            useDateType,
            useOptions,
            useUnionTypes,
        });
    }
};

export default {
    HttpClient,
    generate,
};
