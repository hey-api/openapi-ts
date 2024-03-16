import camelCase from 'camelcase';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';

import type { Enum } from '../client/interfaces/Enum';
import type { Model } from '../client/interfaces/Model';
import type { OperationParameter } from '../client/interfaces/OperationParameter';
import type { Options } from '../client/interfaces/Options';
import type { Service } from '../client/interfaces/Service';
import type { OpenApi } from '../openApi/v3/interfaces/OpenApi';
import type { OpenApiSchema } from '../openApi/v3/interfaces/OpenApiSchema';
import { inferType } from '../openApi/v3/parser/inferType';
import { enumKey, enumName, enumValue } from './enum';
import { escapeName } from './escapeName';
import { unique } from './unique';

const inlineEnum = (openApi: OpenApi, model: Model) => {
    const ref = model.$refs.find(ref => ref.endsWith(model.base));
    if (ref && ref.startsWith('#/')) {
        try {
            const parts = ref.split('/').slice(1);
            const refSchema: OpenApiSchema = parts.reduce((result, key) => {
                if (key in result) {
                    // @ts-ignore
                    return result[key];
                }
                throw new Error('key not found');
            }, openApi);
            const inferredType = inferType(refSchema);
            if (inferredType !== 'enum') {
                throw new Error('not an enum');
            }
            return enumName(model.base, 'type');
        } catch (error) {}
    }
    return model.base;
};

const modelImports = (openApi: OpenApi, model: Model | Service, path: string) => {
    if (!model.imports.length) {
        return '';
    }
    const imports = model.imports.map(item => {
        const ref = model.$refs.find(ref => ref.endsWith(item));
        if (ref && ref.startsWith('#/')) {
            try {
                const parts = ref.split('/').slice(1);
                const refSchema: OpenApiSchema = parts.reduce((result, key) => {
                    if (key in result) {
                        // @ts-ignore
                        return result[key];
                    }
                    throw new Error('key not found');
                }, openApi);
                const inferredType = inferType(refSchema);
                if (inferredType !== 'enum') {
                    throw new Error('not an enum');
                }
                return `import type { ${enumName(item, 'type')} } from '${path + item}';`;
            } catch (error) {}
        }
        return `import type { ${item} } from '${path + item}';`;
    });
    return imports.join('\n');
};

const dataParameters = (parameters: OperationParameter[]) => {
    const output = parameters.map(parameter => {
        const key = parameter.prop;
        const value = parameter.name;
        if (key === value) {
            return key;
        }
        if (escapeName(key) === key) {
            return `${key}: ${value}`;
        }
        return `'${key}': ${value}`;
    });
    return output.join(', ');
};

export const registerHandlebarHelpers = (
    openApi: OpenApi,
    root: Pick<Required<Options>, 'httpClient' | 'serviceResponse' | 'useOptions'>
): void => {
    Handlebars.registerHelper('camelCase', camelCase);

    Handlebars.registerHelper('dataParameters', dataParameters);

    Handlebars.registerHelper('debugThis', function (value) {
        console.log(value);
        return '';
    });

    Handlebars.registerHelper('enumKey', enumKey);
    Handlebars.registerHelper('enumName', enumName);

    Handlebars.registerHelper('enumUnionType', function (enums: Enum[]) {
        return enums
            .map(enumerator => enumValue(enumerator.value))
            .filter(unique)
            .join(' | ');
    });

    Handlebars.registerHelper('enumValue', enumValue);

    Handlebars.registerHelper('equals', function (this: any, a: string, b: string, options: Handlebars.HelperOptions) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('escapeComment', function (value: string) {
        return value
            .replace(/\*\//g, '*')
            .replace(/\/\*/g, '*')
            .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
    });

    Handlebars.registerHelper('escapeDescription', function (value: string) {
        return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    });

    Handlebars.registerHelper('escapeNewline', function (value: string) {
        return value.replace(/\n/g, '\\n');
    });

    Handlebars.registerHelper('exactArray', function (this: any, model: Model, options: Handlebars.HelperOptions) {
        if (model.export === 'array' && model.maxItems && model.minItems && model.maxItems === model.minItems) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifdef', function (this: any, ...args): string {
        const options = args.pop();
        if (!args.every(value => !value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper(
        'ifOperationDataOptional',
        function (this: any, parameters: OperationParameter[], options: Handlebars.HelperOptions) {
            return parameters.every(parameter => !parameter.isRequired) ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper('inlineEnum', (model: Model) => inlineEnum(openApi, model));

    Handlebars.registerHelper(
        'intersection',
        function (this: any, models: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const partialType = Handlebars.partials['type'];
            const types = models.map(model => partialType({ ...root, ...model, parent }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' & ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper('modelImports', (model: Model, path: string) => modelImports(openApi, model, path));

    Handlebars.registerHelper(
        'modelUnionType',
        function (models: Model[], parent: string | undefined, filterProperties: 'exact' | undefined) {
            const partialType = Handlebars.partials['type'];
            const types = models
                .map(model => partialType({ ...root, ...model, parent }))
                .filter((...args) => filterProperties === 'exact' || unique(...args));
            const union = types.join(filterProperties === 'exact' ? ', ' : ' | ');
            return types.length > 1 && types.length !== models.length ? `(${union})` : union;
        }
    );

    Handlebars.registerHelper('nameOperationDataType', function (value: string) {
        return camelCase(['TData', value].join('-'), { pascalCase: true });
    });

    Handlebars.registerHelper(
        'notEquals',
        function (this: any, a: string, b: string, options: Handlebars.HelperOptions) {
            return a !== b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'useDateType',
        function (
            this: any,
            useDateType: boolean | undefined,
            format: string | undefined,
            options: Handlebars.HelperOptions
        ) {
            return useDateType && format === 'date-time' ? options.fn(this) : options.inverse(this);
        }
    );
};
