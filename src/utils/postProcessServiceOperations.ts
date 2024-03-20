import type { Operation, Service } from '../types/client';

export const postProcessServiceOperations = (service: Service): Operation[] => {
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
};
