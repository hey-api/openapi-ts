import path from 'node:path';

import { compiler, TypeScriptFile } from '../../compiler';
import type { OpenApi } from '../../openApi';
import { ensureValidTypeScriptJavaScriptIdentifier } from '../../openApi/common/parser/sanitize';
import { getConfig } from '../config';

/**
 * Generate Schemas using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 */
export const writeSchemas = async (openApi: OpenApi, outputPath: string): Promise<void> => {
    const config = getConfig();

    const fileSchemas = new TypeScriptFile(path.resolve(outputPath, 'schemas.ts'));

    const addSchema = (name: string, obj: any) => {
        const validName = `$${ensureValidTypeScriptJavaScriptIdentifier(name)}`;
        const expression = compiler.types.object({ obj });
        const statement = compiler.export.asConst(validName, expression);
        fileSchemas.add(statement);
    };

    // OpenAPI 2.0
    if ('swagger' in openApi) {
        for (const name in openApi.definitions) {
            if (openApi.definitions.hasOwnProperty(name)) {
                const definition = openApi.definitions[name];
                addSchema(name, definition);
            }
        }
    }

    // OpenAPI 3.x
    if ('openapi' in openApi) {
        if (openApi.components) {
            for (const name in openApi.components.schemas) {
                if (openApi.components.schemas.hasOwnProperty(name)) {
                    const schema = openApi.components.schemas[name];
                    addSchema(name, schema);
                }
            }
            for (const name in openApi.components.parameters) {
                if (openApi.components.parameters.hasOwnProperty(name)) {
                    const parameter = openApi.components.parameters[name];
                    addSchema(name, parameter);
                }
            }
        }
    }

    if (config.schemas) {
        fileSchemas.write('\n\n');
    }
};
