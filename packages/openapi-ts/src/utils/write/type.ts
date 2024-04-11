import { compiler, type Property } from '../../compiler';
import { tsNodeToString } from '../../compiler/utils';
import { Model } from '../../openApi';
import { getConfig } from '../config';
import { enumUnionType } from '../enum';
import { escapeComment } from '../escape';
import { modelIsRequired } from '../required';
import { unique } from '../unique';

const base = (model: Model) => {
    const config = getConfig();
    if (model.base === 'binary') {
        return compiler.typedef.union(['Blob', 'File']);
    }
    if (config.useDateType && model.format === 'date-time') {
        return compiler.typedef.basic('Date');
    }
    return compiler.typedef.basic(model.base);
};

const typeReference = (model: Model) => compiler.typedef.union([base(model)], model.isNullable);

const typeArray = (model: Model) => {
    // Special case where we use tuple to define constant size array.
    if (
        model.export === 'array' &&
        model.link &&
        model.maxItems &&
        model.minItems &&
        model.maxItems === model.minItems &&
        model.maxItems <= 100
    ) {
        const types = toType(model.link)
        const tuple = compiler.typedef.tuple(Array(model.maxItems).fill(types), model.isNullable);
        return tuple;
    }

    if (model.link) {
        return compiler.typedef.array([toType(model.link)], model.isNullable);
    }

    return compiler.typedef.array([base(model)], model.isNullable);
};

const typeEnum = (model: Model) => `${enumUnionType(model.enum)}${model.isNullable ? ' | null' : ''}`;

const typeDict = (model: Model) => {
    const type = model.link ? toType(model.link) : base(model);
    return compiler.typedef.record(['string'], [type], model.isNullable);
};

const typeUnion = (model: Model) => {
    const models = model.properties;
    const types = models.map(m => toType(m)).filter(unique);
    return compiler.typedef.union(types, model.isNullable);
};

const typeIntersect = (model: Model) => {
    const types = model.properties.map(m => toType(m)).filter(unique);
    return compiler.typedef.intersect(types, model.isNullable);
};

const typeInterface = (model: Model) => {
    if (!model.properties.length) {
        return compiler.typedef.basic('unknown');
    }

    const properties: Property[] = model.properties.map(property => {
        let maybeRequired = modelIsRequired(property);
        let value = toType(property);
        // special case for additional properties type
        if (property.name === '[key: string]' && maybeRequired) {
            maybeRequired = '';
            value = tsNodeToString(compiler.typedef.union([value, 'undefined']));
        }
        return {
            comment: [
                property.description && escapeComment(property.description),
                property.deprecated && '@deprecated',
            ],
            isReadOnly: property.isReadOnly,
            isRequired: maybeRequired === '',
            name: property.name,
            type: value,
        };
    });

    return compiler.typedef.interface(properties, model.isNullable);
};

export const toType = (model: Model): string | undefined => {
    switch (model.export) {
        case 'all-of':
            return tsNodeToString(typeIntersect(model));
        case 'any-of':
        case 'one-of':
            return tsNodeToString(typeUnion(model));
        case 'array':
            return tsNodeToString(typeArray(model));
        case 'dictionary':
            return tsNodeToString(typeDict(model));
        case 'enum':
            return typeEnum(model);
        case 'interface':
            return tsNodeToString(typeInterface(model));
        case 'reference':
        default:
            return tsNodeToString(typeReference(model));
    }
};
