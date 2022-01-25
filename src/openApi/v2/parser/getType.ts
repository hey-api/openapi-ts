import type { Type } from '../../../client/interfaces/Type';
import { getMappedType } from './getMappedType';
import { stripNamespace } from './stripNamespace';

const encode = (value: string): string => {
    return value.replace(/^[^a-zA-Z_$]+/g, '').replace(/[^\w$]+/g, '_');
};

/**
 * Parse any string value into a type object.
 * @param type String value like "integer" or "Link[Model]".
 * @param format String value like "binary" or "date".
 */
export const getType = (type: string = 'any', format?: string): Type => {
    const result: Type = {
        type: 'any',
        base: 'any',
        template: null,
        imports: [],
        isNullable: false,
    };

    const mapped = getMappedType(type, format);
    if (mapped) {
        result.type = mapped;
        result.base = mapped;
        return result;
    }

    const typeWithoutNamespace = decodeURIComponent(stripNamespace(type));

    if (/\[.*\]$/g.test(typeWithoutNamespace)) {
        const matches = typeWithoutNamespace.match(/(.*?)\[(.*)\]$/);
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
            return result;
        }
    }

    if (typeWithoutNamespace) {
        const type = encode(typeWithoutNamespace);
        result.type = type;
        result.base = type;
        result.imports.push(type);
        return result;
    }

    return result;
};
