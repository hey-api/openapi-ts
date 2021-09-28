import type { Type } from '../../../client/interfaces/Type';
import { getMappedType, hasMappedType } from './getMappedType';
import { stripNamespace } from './stripNamespace';

function encode(value: string): string {
    return value.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
}

/**
 * Parse any string value into a type object.
 * @param value String value like "integer" or "Link[Model]".
 * @param template Optional template class from parent (needed to process generics)
 */
export function getType(value?: string, template?: string): Type {
    const result: Type = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        isNullable: false,
    };

    const valueClean = stripNamespace(value || '');

    if (/\[.*\]$/g.test(valueClean)) {
        const matches = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches?.length) {
            const match1 = getType(encode(matches[1]));
            const match2 = getType(encode(matches[2]));

            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = match2.type;
                match1.imports = [];
            } else if (match2.type) {
                result.type = `${match1.type}<${match2.type}>`;
                result.base = match1.type;
                result.template = match2.type;
            } else {
                result.type = match1.type;
                result.base = match1.type;
                result.template = match1.type;
            }

            result.imports.push(...match1.imports);
            result.imports.push(...match2.imports);
        }
    } else if (hasMappedType(valueClean)) {
        const mapped = getMappedType(valueClean);
        if (mapped) {
            result.type = mapped;
            result.base = mapped;
        }
    } else if (valueClean) {
        const type = encode(valueClean);
        result.type = type;
        result.base = type;
        result.imports.push(type);
    }

    // If the property that we found matched the parent template class
    // Then ignore this whole property and return it as a "T" template property.
    if (result.type === template) {
        result.type = 'T'; // Template;
        result.base = 'T'; // Template;
        result.imports = [];
    }

    return result;
}
