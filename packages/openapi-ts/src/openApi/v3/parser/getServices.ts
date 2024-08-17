import type { Client } from '../../../types/client';
import { getConfig } from '../../../utils/config';
import { unique } from '../../../utils/unique';
import type { Operation, Service } from '../../common/interfaces/client';
import {
  allowedServiceMethods,
  getNewService,
} from '../../common/parser/service';
import type { OpenApi } from '../interfaces/OpenApi';
import { getOperationParameters } from './getOperationParameters';
import { getOperation } from './operation';

export const getServices = ({
  openApi,
  types,
}: {
  openApi: OpenApi;
  types: Client['types'];
}): Pick<Client, 'operationIds' | 'services'> => {
  const config = getConfig();

  const regexp = config.services.filter
    ? new RegExp(config.services.filter)
    : undefined;

  const operationIds = new Map<string, string>();
  const services = new Map<string, Service>();

  for (const url in openApi.paths) {
    const path = openApi.paths[url];
    const pathParameters = getOperationParameters({
      openApi,
      parameters: path.parameters ?? [],
      types,
    });

    for (const key in path) {
      const method = key as Lowercase<Operation['method']>;

      const operationKey = `${method.toUpperCase()} ${url}`;
      const shouldProcess = !regexp || regexp.test(operationKey);

      if (shouldProcess && allowedServiceMethods.includes(method)) {
        const op = path[method]!;

        if (op.operationId) {
          if (operationIds.has(op.operationId)) {
            console.warn(
              `❗️ Duplicate operationId: ${op.operationId} in ${operationKey}. Please ensure your operation IDs are unique. This behavior is not supported and will likely lead to unexpected results.`,
            );
          } else {
            operationIds.set(op.operationId, operationKey);
          }
        }

        const tags =
          op.tags?.length && (config.services.asClass || config.name)
            ? op.tags.filter(unique)
            : ['Default'];
        tags.forEach((tag) => {
          const operation = getOperation({
            method,
            op,
            openApi,
            pathParams: pathParameters,
            tag,
            types,
            url,
          });
          const service =
            services.get(operation.service) || getNewService(operation);
          service.$refs = [...service.$refs, ...operation.$refs];
          service.imports = [...service.imports, ...operation.imports];
          service.operations = [...service.operations, operation];
          services.set(operation.service, service);
        });
      }
    }
  }

  return {
    operationIds,
    services: Array.from(services.values()),
  };
};
