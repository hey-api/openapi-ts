import { createClient } from '../../../';

export const generateClient = async (
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios' | 'angular',
    useOptions: boolean = false,
    name?: string
) => {
    await createClient({
        client,
        input: `./test/spec/${version}.json`,
        name,
        output: `./test/e2e/generated/${dir}/`,
        useOptions,
    });
};
