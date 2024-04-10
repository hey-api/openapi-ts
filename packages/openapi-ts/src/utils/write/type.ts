import { addLeadingJSDocComment } from '../../compiler/utils';
import { Model } from '../../openApi';
import { getConfig } from '../config';
import { enumUnionType } from '../enum';
import { escapeComment } from '../escape';
import { modelIsRequired } from '../required';
import { unique } from '../unique';

const base = (model: Model) => {
    const config = getConfig();

    if (model.base === 'binary') {
        return 'Blob | File';
    }

    if (config.useDateType && model.format === 'date-time') {
        return 'Date';
    }

    return model.base;
};

const typeReference = (model: Model) => `${base(model)}${model.isNullable ? ' | null' : ''}`;

const typeArray = (model: Model): string | undefined => {
    if (
        model.export === 'array' &&
        model.link &&
        model.maxItems &&
        model.minItems &&
        model.maxItems === model.minItems
    ) {
        return `[${toType(model.link, 'exact')}]${model.isNullable ? ' | null' : ''}`;
    }

    if (model.link) {
        return `Array<${toType(model.link)}>${model.isNullable ? ' | null' : ''}`;
    }

    return `Array<${base(model)}>${model.isNullable ? ' | null' : ''}`;
};

const typeEnum = (model: Model) => `${enumUnionType(model.enum)}${model.isNullable ? ' | null' : ''}`;

const typeDict = (model: Model): string => {
    if (model.link) {
        return `Record<string, ${toType(model.link)}>${model.isNullable ? ' | null' : ''}`;
    }
    return `Record<string, ${base(model)}>${model.isNullable ? ' | null' : ''}`;
};

const typeUnion = (model: Model, filterProperties: 'exact' | undefined = undefined) => {
    const models = model.properties;
    const types = models.map(m => toType(m)).filter((...args) => filterProperties === 'exact' || unique(...args));
    const union = types.join(filterProperties === 'exact' ? ', ' : ' | ');
    const unionString = types.length > 1 && types.length !== models.length ? `(${union})` : union;
    return `${unionString}${model.isNullable ? ' | null' : ''}`;
};

const typeIntersect = (model: Model) => {
    const types = model.properties.map(m => toType(m)).filter(unique);
    let typesString = types.join(' & ');
    if (types.length > 1) {
        typesString = `(${typesString})`;
    }
    return `${typesString}${model.isNullable ? ' | null' : ''}`;
};

const typeInterface = (model: Model) => {
    if (!model.properties.length) {
        return 'unknown';
    }

    return `{
        ${model.properties
            .map(property => {
                let s = '';
                if (property.description || property.deprecated) {
                    s += addLeadingJSDocComment(undefined, [
                        property.description && ` * ${escapeComment(property.description)}`,
                        property.deprecated && ` * @deprecated`,
                    ]);
                }
                let maybeRequired = modelIsRequired(property);
                let value = toType(property);
                // special case for additional properties type
                if (property.name === '[key: string]' && maybeRequired) {
                    maybeRequired = '';
                    value = `${value} | undefined`;
                }
                s += `${property.isReadOnly ? 'readonly ' : ''}${property.name}${maybeRequired}: ${value}`;
                return s;
            })
            .join('\n')}
    }${model.isNullable ? ' | null' : ''}`;
};

export const toType = (model: Model, filterProperties: 'exact' | undefined = undefined): string | undefined => {
    switch (model.export) {
        case 'all-of':
            return typeIntersect(model);
        case 'any-of':
        case 'one-of':
            return typeUnion(model, filterProperties);
        case 'array':
            return typeArray(model);
        case 'dictionary':
            return typeDict(model);
        case 'enum':
            return typeEnum(model);
        case 'interface':
            return typeInterface(model);
        case 'reference':
        default:
            return typeReference(model);
    }
};
