import type { Options } from './client/interfaces/Options';
import { HttpClient } from './HttpClient';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiSpecParser } from './utils/getOpenApiSpecParser';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/write/client';

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
        base,
        clientName,
        enums = false,
        exportCore = true,
        exportModels = true,
        exportSchemas = false,
        exportServices = true,
        httpClient = HttpClient.FETCH,
        input,
        operationId = true,
        output,
        postfixModels = '',
        postfixServices = 'Service',
        request,
        serviceResponse = 'body',
        useDateType = false,
        useOptions = false,
        write = true,
    } = options;

    const defaultOptions: Omit<Required<Options>, 'base' | 'clientName' | 'request'> &
        Pick<Options, 'base' | 'clientName' | 'request'> = {
        autoformat,
        base,
        clientName,
        enums,
        exportCore,
        exportModels,
        exportSchemas,
        exportServices,
        httpClient,
        input,
        operationId,
        output,
        postfixModels,
        postfixServices,
        request,
        serviceResponse,
        useDateType,
        useOptions,
        write,
    };

    const openApi =
        typeof defaultOptions.input === 'string' ? await getOpenApiSpec(defaultOptions.input) : defaultOptions.input;
    const parser = getOpenApiSpecParser(openApi);
    const templates = registerHandlebarTemplates(openApi, defaultOptions);

    const client = parser(openApi, defaultOptions);
    const clientFinal = postProcessClient(client);
    if (write) {
        await writeClient(clientFinal, templates, defaultOptions);
    }
};

export default {
    HttpClient,
    generate,
};
