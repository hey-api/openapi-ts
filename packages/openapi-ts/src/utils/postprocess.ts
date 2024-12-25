import type { Client as ParserClient, Model } from '../openApi';
import { sanitizeNamespaceIdentifier } from '../openApi';
import type { Client, Operation, Service } from '../types/client';
import type { Config } from '../types/config';
import { getConfig, legacyNameFromConfig } from './config';
import { sort } from './sort';
import { stringCase } from './stringCase';
import { unique } from './unique';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
export function postProcessClient(
  client: Omit<ParserClient, 'config'>,
  config: Config,
): Client {
  return {
    ...client,
    config,
    models: client.models.map((model) => postProcessModel(model)),
    services: postProcessOperations(client.operations).map(postProcessService),
    types: {},
  };
}

const postProcessModel = (model: Model): Model => ({
  ...model,
  $refs: model.$refs.filter((value, index, arr) => unique(value, index, arr)),
  enum: model.enum.filter(
    (value, index, arr) =>
      arr.findIndex((item) => item.value === value.value) === index,
  ),
  enums: model.enums.filter(
    (value, index, arr) =>
      arr.findIndex((item) => item.name === value.name) === index,
  ),
  imports: model.imports
    .filter(
      (value, index, arr) => unique(value, index, arr) && value !== model.name,
    )
    .sort(sort),
});

const postProcessOperations = (
  operations: ParserClient['operations'],
): Client['services'] => {
  const config = getConfig();

  const services = new Map<string, Service>();

  operations.forEach((parserOperation) => {
    const tags =
      parserOperation.tags?.length &&
      (config.plugins['@hey-api/sdk']?.asClass || legacyNameFromConfig(config))
        ? parserOperation.tags.filter(unique)
        : ['Default'];
    tags.forEach((tag) => {
      const operation: Operation = {
        ...parserOperation,
        service: getServiceName(tag),
      };
      const service =
        services.get(operation.service) || getNewService(operation);
      service.$refs = [...service.$refs, ...operation.$refs];
      service.imports = [...service.imports, ...operation.imports];
      service.operations = [...service.operations, operation];
      services.set(operation.service, service);
    });
  });

  return Array.from(services.values());
};

const postProcessService = (service: Service): Service => {
  const clone = { ...service };
  clone.operations = postProcessServiceOperations(clone);
  clone.operations.forEach((operation) => {
    clone.imports.push(...operation.imports);
  });
  clone.imports = clone.imports.filter(unique).sort(sort);
  return clone;
};

const postProcessServiceOperations = (service: Service): Operation[] => {
  const names = new Map<string, number>();

  return service.operations.map((operation) => {
    const clone = { ...operation };

    // Parse the service parameters and successes, very similar to how we parse
    // properties of models. These methods will extend the type if needed.
    clone.imports.push(
      ...clone.parameters.flatMap((parameter) => parameter.imports),
    );
    const successResponses = clone.responses.filter((response) =>
      response.responseTypes.includes('success'),
    );
    clone.imports.push(...successResponses.flatMap((result) => result.imports));

    // Check if the operation name is unique, if not then prefix this with a number
    const name = clone.name;
    const index = names.get(name) || 0;
    if (index > 0) {
      clone.name = `${name}${index}`;
    }
    names.set(name, index + 1);

    return clone;
  });
};

export const getNewService = (operation: Operation): Service => ({
  $refs: [],
  imports: [],
  name: operation.service,
  operations: [],
});

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string =>
  stringCase({
    case: 'PascalCase',
    value: sanitizeNamespaceIdentifier(value),
  });
