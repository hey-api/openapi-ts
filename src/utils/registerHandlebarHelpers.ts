import camelCase from 'camelcase';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';

import type { Model } from '../client/interfaces/Model';
import type { OperationParameter } from '../client/interfaces/OperationParameter';
import type { Options } from '../client/interfaces/Options';
import type { Service } from '../client/interfaces/Service';
import type { OpenApi } from '../openApi/v3/interfaces/OpenApi';
import { enumKey, enumName, enumUnionType, enumValue } from './enum';
import { escapeName } from './escapeName';
import { unique } from './unique';

const modelsExports = (config: Options, models: Model[], path: string) => {
    const output = models.map(model => {
        const importedModel = config.postfixModels
            ? `${model.name} as ${model.name + config.postfixModels}`
            : model.name;
        let result = [`export type { ${importedModel} } from '${path + model.name}';`];
        if (config.enums && (model.enum.length || model.enums.length)) {
            const names = model.enums.map(enumerator => enumerator.name).filter(Boolean);
            const enumExports = names.length ? names : [model.name];
            const enumExportsString = enumExports.map(name => enumName(name)).join(', ');
            result = [...result, `export { ${enumExportsString} } from '${path + model.name}';`];
        }
        return result.join('\n');
    });
    return output.join('\n');
};

const modelImports = (model: Model | Service, path: string) => {
    if (!model.imports.length) {
        return '';
    }
    const output = model.imports.map(item => `import type { ${item} } from '${path + item}';`);
    return output.join('\n');
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

const debugThis = (value: any) => {
    console.log(value);
    return '';
};

export const registerHandlebarHelpers = (
    openApi: OpenApi,
    config: Omit<Required<Options>, 'base' | 'clientName' | 'request'>
): void => {
    Handlebars.registerHelper('camelCase', camelCase);
    Handlebars.registerHelper('dataParameters', dataParameters);
    Handlebars.registerHelper('debugThis', debugThis);
    Handlebars.registerHelper('enumKey', enumKey);
    Handlebars.registerHelper('enumName', enumName);
    Handlebars.registerHelper('enumUnionType', enumUnionType);
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

    Handlebars.registerHelper(
        'intersection',
        function (this: any, models: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const partialType = Handlebars.partials['type'];
            const types = models.map(model => partialType({ $config: config, ...model, parent }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' & ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper('modelImports', modelImports);
    Handlebars.registerHelper('modelsExports', modelsExports);

    Handlebars.registerHelper(
        'modelUnionType',
        function (models: Model[], parent: string | undefined, filterProperties: 'exact' | undefined) {
            const partialType = Handlebars.partials['type'];
            const types = models
                .map(model => partialType({ $config: config, ...model, parent }))
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
        function (this: any, config: Options, format: string | undefined, options: Handlebars.HelperOptions) {
            return config.useDateType && format === 'date-time' ? options.fn(this) : options.inverse(this);
        }
    );
};
