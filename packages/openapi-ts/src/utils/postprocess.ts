import type { Model, Operation, Service } from '../openApi';
import type { Client } from '../types/client';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
export function postProcessClient(client: Client): Client {
  return {
    ...client,
    models: client.models.map((model) => postProcessModel(model)),
    services: client.services.map((service) => postProcessService(service)),
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
