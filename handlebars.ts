import { readFileSync } from 'node:fs';
import path from 'node:path';

import handlebars from 'handlebars';
import type { Plugin } from 'rollup';

/**
 * Custom plugin to parse handlebar imports and precompile
 * the template on the fly. This reduces runtime by about
 * half on large projects.
 */
export function handlebarsPlugin(): Plugin {
    return {
        name: 'handlebars',
        resolveId: (file: any, importer: any) => {
            if (path.extname(file) === '.hbs') {
                return path.resolve(path.dirname(importer), file);
            }
            return null;
        },
        load: (file: any) => {
            if (path.extname(file) === '.hbs') {
                const template = readFileSync(file, 'utf8').toString().trim();
                const templateSpec = handlebars.precompile(template, {
                    knownHelpers: {
                        camelCase: true,
                        dataParameters: true,
                        debugThis: true,
                        enumKey: true,
                        enumName: true,
                        enumUnionType: true,
                        enumValue: true,
                        equals: true,
                        escapeComment: true,
                        escapeDescription: true,
                        escapeNewline: true,
                        exactArray: true,
                        ifdef: true,
                        ifOperationDataOptional: true,
                        intersection: true,
                        modelImports: true,
                        modelsExports: true,
                        modelUnionType: true,
                        nameOperationDataType: true,
                        notEquals: true,
                        operationDataType: true,
                        useDateType: true,
                    },
                    knownHelpersOnly: true,
                    noEscape: true,
                    preventIndent: true,
                    strict: true,
                });
                return `export default ${templateSpec};`;
            }
            return null;
        },
    };
}
