import $RefParser from '@apidevtools/json-schema-ref-parser';
import { resolve } from 'path';

import { exists } from './fileSystem';

const fetch = require('node-fetch');

globalThis.fetch = fetch;

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fall back
 * on parsing the file as JSON.
 * @param location: Path or url
 */
export const getOpenApiSpec = async (location: string): Promise<any> => {
    const absolutePathOrUrl = (await exists(location)) ? resolve(location) : location;
    const schema = await $RefParser.bundle(absolutePathOrUrl, absolutePathOrUrl, {});
    return schema;
};
