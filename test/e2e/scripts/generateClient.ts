import { generate as __generate } from '../../../';

export const generateClient = async (
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios' | 'angular',
    useOptions: boolean = false,
    clientName?: string
) => {
    await __generate({
        client,
        clientName,
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/${dir}/`,
        useOptions,
    });
};
