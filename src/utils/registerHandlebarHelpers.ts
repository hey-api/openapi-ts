import camelCase from 'camelcase';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';

import type { Enum } from '../client/interfaces/Enum';
import type { Model } from '../client/interfaces/Model';
import type { OperationParameter } from '../client/interfaces/OperationParameter';
import type { Options } from '../client/interfaces/Options';
import { unique } from './unique';

/**
 * Enums can't contain hyphens in their name. Additionally, name might've been
 * already escaped, so we need to remove quotes around it.
 * {@link https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1969}
 */
const escapeEnumName = (name?: string) => {
    if (!name) {
        return name;
    }
    let escapedName = name;
    if (name.startsWith("'") && name.endsWith("'")) {
        escapedName = name.slice(1, name.length - 1);
    }
    return escapedName.replace(/-([a-z])/gi, ($0, $1: string) => $1.toLocaleUpperCase());
};

export const registerHandlebarHelpers = (
    root: Pick<Required<Options>, 'httpClient' | 'serviceResponse' | 'useOptions' | 'useUnionTypes'>
): void => {
    Handlebars.registerHelper('camelCase', function (value: string): string {
        return camelCase(value);
    });

    Handlebars.registerHelper(
        'containsSpaces',
        function (this: any, value: string, options: Handlebars.HelperOptions): string {
            return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'enumerator',
        function (
            this: any,
            enumerators: Enum[],
            parent: string | undefined,
            name: string | undefined,
            options: Handlebars.HelperOptions
        ) {
            if (!root.useUnionTypes && parent && name) {
                return `${parent}.${escapeEnumName(name)}`;
            }
            return options.fn(
                enumerators
                    .map(enumerator => enumerator.value)
                    .filter(unique)
                    .join(' | ')
            );
        }
    );

    Handlebars.registerHelper(
        'equals',
        function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
            return a === b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper('escapeComment', function (value: string): string {
        return value
            .replace(/\*\//g, '*')
            .replace(/\/\*/g, '*')
            .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);
    });

    Handlebars.registerHelper('escapeDescription', function (value: string): string {
        return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    });

    Handlebars.registerHelper('escapeEnumName', function (this: any, name: string | undefined) {
        return escapeEnumName(name);
    });

    Handlebars.registerHelper('escapeNewline', function (value: string): string {
        return value.replace(/\n/g, '\\n');
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
        function (this: any, parameters: OperationParameter[], options: Handlebars.HelperOptions): string {
            return parameters.every(parameter => !parameter.isRequired) ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'intersection',
        function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const type = Handlebars.partials['type'];
            const types = properties.map(property => type({ ...root, ...property, parent }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' & ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper('nameOperationDataType', function (value: string): string {
        return camelCase(['TData', value].join('-'), { pascalCase: true });
    });

    Handlebars.registerHelper(
        'notEquals',
        function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
            return a !== b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'union',
        function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const type = Handlebars.partials['type'];
            const types = properties.map(property => type({ ...root, ...property, parent }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' | ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
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
