import Path from 'path';

import type { Options } from '../client/interfaces/Options';
import type { Service } from '../client/interfaces/Service';
import { writeFile } from './fileSystem';
import { formatCode as f } from './formatCode';
import { formatIndentation as i } from './formatIndentation';
import type { Templates } from './registerHandlebarTemplates';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param services Array of Services to write
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 * @param options Options passed to the `generate()` function
 */
export const writeClientServices = async (
    services: Service[],
    templates: Templates,
    outputPath: string,
    options: Pick<Required<Options>, 'httpClient' | 'indent' | 'postfixServices' | 'serviceResponse' | 'useOptions'> &
        Omit<Options, 'httpClient' | 'indent' | 'postfixServices' | 'serviceResponse' | 'useOptions'>
): Promise<void> => {
    for (const service of services) {
        const file = Path.resolve(outputPath, `${service.name}${options.postfixServices}.ts`);
        const templateResult = templates.exports.service({
            ...service,
            exportClient: Boolean(options.clientName),
            httpClient: options.httpClient,
            postfix: options.postfixServices,
            serviceResponse: options.serviceResponse,
            useOptions: options.useOptions,
        });
        await writeFile(file, i(f(templateResult), options.indent));
    }
};
