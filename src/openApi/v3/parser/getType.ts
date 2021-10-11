import type { Type } from '../../../client/interfaces/Type';
import { getMappedType, hasMappedType } from './getMappedType';
import { stripNamespace } from './stripNamespace';

function encode(value: string): string {
    return value.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
}
/**
 * Parse any string value into a type object.
 * @param values String or String[] value like "integer", "Link[Model]" or ["string", "null"]
 * @param template Optional template class from parent (needed to process generics)
 */
export function getType(values?: string | string[], template?: string): Type {
    const result: Type = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        isNullable: false,
    };

    // Special case for JSON Schema spec (december 2020, page 17),
    // that allows type to be an array of primitive types...
    if (Array.isArray(values)) {
        const type = values
            .filter(value => value !== 'null')
            .filter(value => hasMappedType(value))
            .map(value => getMappedType(value))
            .join(' | ');
        result.type = type;
        result.base = type;
        result.isNullable = values.includes('null');
        return result;
    }

    const valueClean = decodeURIComponent(stripNamespace(values || ''));

    if (/\[.*\]$/g.test(valueClean)) {
        const matches = valueClean.match(/(.*?)\[(.*)\]$/);
        if (matches?.length) {
            const match1 = getType(encode(matches[1]));
            const match2 = getType(encode(matches[2]));

            if (match1.type === 'any[]') {
                result.type = `${match2.type}[]`;
                result.base = `${match2.type}`;
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
