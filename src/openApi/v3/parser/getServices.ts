import type { Operation } from '../../../client/interfaces/Operation';
import type { Options } from '../../../client/interfaces/Options';
import type { Service } from '../../../client/interfaces/Service';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperation } from './getOperation';
import { getOperationParameters } from './getOperationParameters';

const getNewService = (operation: Operation): Service => ({
    $refs: [],
    imports: [],
    name: operation.service,
    operations: [],
});

/**
 * Get the OpenAPI services
 */
export const getServices = (openApi: OpenApi, options: Options): Service[] => {
    const services = new Map<string, Service>();
    for (const url in openApi.paths) {
        if (openApi.paths.hasOwnProperty(url)) {
            // Grab path and parse any global path parameters
            const path = openApi.paths[url];
            const pathParams = getOperationParameters(openApi, path.parameters || []);

            // Parse all the methods for this path
            for (const method in path) {
                if (path.hasOwnProperty(method)) {
                    switch (method) {
                        case 'delete':
                        case 'get':
                        case 'head':
                        case 'options':
                        case 'patch':
                        case 'post':
                        case 'put':
                            // Each method contains an OpenAPI operation, we parse the operation
                            const op = path[method]!;
                            const tags = op.tags?.length ? op.tags.filter(unique) : ['Default'];
                            tags.forEach(tag => {
                                const operation = getOperation(openApi, url, method, tag, op, pathParams, options);
                                const service = services.get(operation.service) || getNewService(operation);
                                service.$refs = [...service.$refs, ...operation.$refs];
                                service.imports = [...service.imports, ...operation.imports];
                                service.operations = [...service.operations, operation];
                                services.set(operation.service, service);
                            });
                            break;
                    }
                }
            }
        }
    }
    return Array.from(services.values());
};
