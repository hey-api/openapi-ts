// @ts-nocheck

import * as Handlebars from 'handlebars/runtime';

export function registerHandlebarHelpers(): void {
    Handlebars.registerHelper('equals', function (a: string, b: string, options: Handlebars.HelperOptions): string {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('notEquals', function (a: string, b: string, options: Handlebars.HelperOptions): string {
        return a !== b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('containsSpaces', function (value: string): boolean {
        return /\s+/.test(value);
    });
}
