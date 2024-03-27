import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Client } from '../../types/client';
import type { Config } from '../../types/config';
import { enumName } from '../enum';
import type { Templates } from '../handlebars';

/**
 * Generate Models using the Handlebar template and write to disk.
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param config {@link Config} passed to the `createClient()` method
 */
export const writeClientModels = async (
    client: Client,
    templates: Templates,
    outputPath: string,
    config: Config
): Promise<void> => {
    // Generate a file for each model.
    for (const model of client.models) {
        const file = path.resolve(outputPath, `${model.name}.ts`);
        const templateResult = templates.exports.model({
            $config: config,
            ...model,
        });
        await writeFileSync(file, templateResult);
    }
    // Generate an index.ts file exporting all models from each file generated above.
    const file = path.resolve(outputPath, 'index.ts');
    const content = exportsModels(config, client);
    await writeFileSync(file, content);
};

const exportsModels = (config: Config, client: Client) => {
    const path = './';
    const output = client.models.map(model => {
        const importedModel = config.postfixModels
            ? `${model.name} as ${model.name + config.postfixModels}`
            : model.name;
        const exp = config.useLegacyEnums ? 'export' : 'export type';
        let result = [`${exp} { ${importedModel} } from '${path + model.name}';`];
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
