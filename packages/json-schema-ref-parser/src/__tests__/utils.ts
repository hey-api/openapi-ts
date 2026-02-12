import path from 'node:path';

export const getSpecsPath = (): string => path.join(__dirname, '..', '..', '..', '..', 'specs');
