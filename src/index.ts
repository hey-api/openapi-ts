import type { Options } from './client/interfaces/Options';
import { HttpClient } from './HttpClient';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiSpecParser } from './utils/getOpenApiSpecParser';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export { HttpClient } from './HttpClient';

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param options Options passed to the generate method
 */
export const generate = async (options: Options): Promise<void> => {
    const {
        autoformat = true,
        exportCore = true,
        exportModels = true,
        exportSchemas = false,
        exportServices = true,
        httpClient = HttpClient.FETCH,
        postfixModels = '',
        postfixServices = 'Service',
        serviceResponse = 'body',
        useDateType = false,
        useOptions = false,
        write = true,
    } = options;
    const openApi = typeof options.input === 'string' ? await getOpenApiSpec(options.input) : options.input;
    const parser = getOpenApiSpecParser(openApi);
    const templates = registerHandlebarTemplates(openApi, {
        httpClient,
        serviceResponse,
        useOptions,
    });

    const client = parser(openApi, options);
    const clientFinal = postProcessClient(client);
    if (write) {
        await writeClient(clientFinal, templates, {
            ...options,
            autoformat,
            exportCore,
            exportModels,
            exportSchemas,
            exportServices,
            httpClient,
            postfixModels,
            postfixServices,
            serviceResponse,
            useDateType,
            useOptions,
        });
    }
};

export default {
    HttpClient,
    generate,
};
