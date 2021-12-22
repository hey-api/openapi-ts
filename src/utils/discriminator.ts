import type { Model } from '../client/interfaces/Model';
import type { OpenApi } from '../openApi/v3/interfaces/OpenApi';
import type { OpenApiDiscriminator } from '../openApi/v3/interfaces/OpenApiDiscriminator';
import { stripNamespace } from '../openApi/v3/parser/stripNamespace';
import type { Dictionary } from './types';

function inverseDictionary(map: Dictionary<string>): Dictionary<string> {
    const m2: Dictionary<string> = {};
    for (const key in map) {
        m2[map[key]] = key;
    }
    return m2;
}

export function findOneOfParentDiscriminator(openApi: OpenApi, parent?: Model): OpenApiDiscriminator | undefined {
    if (openApi.components) {
        for (const definitionName in openApi.components.schemas) {
            if (openApi.components.schemas.hasOwnProperty(definitionName)) {
                const schema = openApi.components.schemas[definitionName];
                if (parent && schema.oneOf?.length && schema.discriminator) {
                    const isPartOf =
                        schema.oneOf
                            .map(definition => definition.$ref && stripNamespace(definition.$ref) === parent.name)
                            .filter(Boolean).length > 0;
                    if (isPartOf) {
                        return schema.discriminator;
                    }
                }
            }
        }
    }
    return;
}

export function mapPropertyValue(discriminator: OpenApiDiscriminator, parent: Model): string {
    if (discriminator.mapping) {
        const mapping = inverseDictionary(discriminator.mapping);
        const key = Object.keys(mapping).find(item => stripNamespace(item) == parent.name);
        if (key && mapping[key]) {
            return mapping[key];
        }
    }
    return parent.name;
}
