import * as Handlebars from 'handlebars/runtime';

import { Model } from '../client/interfaces/Model';
import { unique } from './unique';

export function registerHandlebarHelpers(): void {
    Handlebars.registerHelper('equals', function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('notEquals', function (this: any, a: string, b: string, options: Handlebars.HelperOptions): string {
        return a !== b ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('containsSpaces', function (this: any, value: string, options: Handlebars.HelperOptions): string {
        return /\s+/.test(value) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('union', function (this: any, properties: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
        const type = Handlebars.partials['type'];
        const types = properties.map(property =>
            type({
                ...property,
                parent,
            })
        );
        return options.fn(types.filter(unique).join(' | '));
    });
}
