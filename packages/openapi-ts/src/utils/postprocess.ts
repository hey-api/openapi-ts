import type { Enum, Model, Operation, Service } from '../openApi';
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
        models: client.models.map(model => postProcessModel(model)),
        services: client.services.map(service => postProcessService(service)),
    };
}

/**
 * Post processes the model.
 * This will clean up any double imports or enum values.
 * @param model
 */
export function postProcessModel(model: Model): Model {
    return {
        ...model,
        enum: postProcessModelEnum(model),
        enums: postProcessModelEnums(model),
        imports: postProcessModelImports(model),
    };
}

/**
 * Set unique enum values for the model
 * @param model
 */
export function postProcessModelEnum(model: Model): Enum[] {
    return model.enum.filter((property, index, arr) => arr.findIndex(item => item.value === property.value) === index);
}

/**
 * Set unique enum values for the model
 * @param model The model that is post-processed
 */
export function postProcessModelEnums(model: Model): Model[] {
    return model.enums.filter((property, index, arr) => arr.findIndex(item => item.name === property.name) === index);
}

/**
 * Set unique imports, sorted by name
 * @param model The model that is post-processed
 */
export function postProcessModelImports(model: Model): string[] {
    return model.imports
        .filter(unique)
        .sort(sort)
        .filter(name => model.name !== name);
}

export function postProcessService(service: Service): Service {
    const clone = { ...service };
    clone.operations = postProcessServiceOperations(clone);
    clone.operations.forEach(operation => {
        clone.imports.push(...operation.imports);
    });
    clone.imports = postProcessServiceImports(clone);
    return clone;
}

/**
 * Set unique imports, sorted by name
 * @param service
 */
export function postProcessServiceImports(service: Service): string[] {
    return service.imports.filter(unique).sort(sort);
}

export function postProcessServiceOperations(service: Service): Operation[] {
    const names = new Map<string, number>();

    return service.operations.map(operation => {
        const clone = { ...operation };

        // Parse the service parameters and results, very similar to how we parse
        // properties of models. These methods will extend the type if needed.
        clone.imports.push(...clone.parameters.flatMap(parameter => parameter.imports));
        clone.imports.push(...clone.results.flatMap(result => result.imports));

        // Check if the operation name is unique, if not then prefix this with a number
        const name = clone.name;
        const index = names.get(name) || 0;
        if (index > 0) {
            clone.name = `${name}${index}`;
        }
        names.set(name, index + 1);

        return clone;
    });
}
