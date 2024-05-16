import type { Client } from '../../../types/client';
import { getConfig, isStandaloneClient } from '../../../utils/config';
import { unique } from '../../../utils/unique';
import type { Service } from '../../common/interfaces/client';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperation } from './getOperation';
import { getOperationParameters } from './getOperationParameters';

/**
 * Get the OpenAPI services
 */
export const getServices = ({
  openApi,
  types,
}: {
  openApi: OpenApi;
  types: Client['types'];
}): Service[] => {
  const config = getConfig();

  const services = new Map<string, Service>();

  Object.entries(openApi.paths).forEach(([url, path]) => {
    // Grab path and parse any global path parameters
    const pathParams = getOperationParameters({
      openApi,
      parameters: path.parameters || [],
      types,
    });

    Object.keys(path).forEach((method) => {
      // Parse all the methods for this path
      switch (method) {
        case 'get':
        case 'put':
        case 'post':
        case 'delete':
        case 'options':
        case 'head':
        case 'patch': {
          // Each method contains an OpenAPI operation, we parse the operation
          const op = path[method]!;
          const tags =
            op.tags?.length && !isStandaloneClient(config)
              ? op.tags.filter(unique)
              : ['Default'];
          tags.forEach((tag) => {
            const operation = getOperation({
              method,
              op,
              openApi,
              pathParams,
              tag,
              types,
              url,
            });

            // If we have already declared a service, then we should fetch that and
            // append the new method to it. Otherwise we should create a new service object.
            const service: Service = services.get(operation.service) || {
              $refs: [],
              imports: [],
              name: operation.service,
              operations: [],
            };

            // Push the operation in the service
            service.operations.push(operation);
            service.imports.push(...operation.imports);
            services.set(operation.service, service);
          });
          break;
        }
      }
    });
  });

  return Array.from(services.values());
};
