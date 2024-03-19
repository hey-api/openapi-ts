import type { Operation } from '../../../client/interfaces/Operation';
import type { Service } from '../../../client/interfaces/Service';
import type { Config } from '../../../types/config';
import { unique } from '../../../utils/unique';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperationParameters } from './getOperationParameters';
import { getOperation } from './operation';
import { allowedServiceMethods } from './service';

const getNewService = (operation: Operation): Service => ({
    $refs: [],
    imports: [],
    name: operation.service,
    operations: [],
});

export const getServices = (openApi: OpenApi, options: Config): Service[] => {
    const services = new Map<string, Service>();

    for (const url in openApi.paths) {
        const path = openApi.paths[url];
        const pathParams = getOperationParameters(openApi, path.parameters ?? []);

        for (const key in path) {
            const method = key as Lowercase<Operation['method']>;
            if (allowedServiceMethods.includes(method)) {
                const op = path[method]!;
                const tags = op.tags?.length ? op.tags.filter(unique) : ['Default'];
                tags.forEach(tag => {
                    const operation = getOperation(openApi, options, {
                        method,
                        op,
                        pathParams,
                        tag,
                        url,
                    });
                    const service = services.get(operation.service) || getNewService(operation);
                    service.$refs = [...service.$refs, ...operation.$refs];
                    service.imports = [...service.imports, ...operation.imports];
                    service.operations = [...service.operations, operation];
                    services.set(operation.service, service);
                });
            }
        }
    }

    return Array.from(services.values());
};
