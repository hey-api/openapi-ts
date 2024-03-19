import { readSpecFromDisk } from './readSpecFromDisk';
import { readSpecFromUrl } from './readSpecFromUrl';

export const readSpec = async (input: string): Promise<string> => {
    if (input.startsWith('https://')) {
        return await readSpecFromUrl(input, 'https');
    }
    if (input.startsWith('http://')) {
        return await readSpecFromUrl(input, 'http');
    }
    return await readSpecFromDisk(input);
};
