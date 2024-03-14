import type { Options } from '../../../';
import { generate as __generate } from '../../../';

export const generateClient = async (
    dir: string,
    version: string,
    client?: 'fetch' | 'xhr' | 'node' | 'axios' | 'angular',
    useOptions: boolean = false,
    useUnionTypes: boolean = false,
    clientName?: string,
    options?: Options
) => {
    await __generate({
        clientName,
        httpClient: client,
        useOptions,
        useUnionTypes,
        ...options,
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/${dir}/`,
    });
};
