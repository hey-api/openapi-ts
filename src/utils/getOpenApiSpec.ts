import $RefParser from '@apidevtools/json-schema-ref-parser';
import { resolve } from 'path';

import type { OpenApi as OpenApiV2 } from '../openApi/v2/interfaces/OpenApi';
import type { OpenApi as OpenApiV3 } from '../openApi/v3/interfaces/OpenApi';
import { exists } from './fileSystem';

const fetch = require('node-fetch');

globalThis.fetch = fetch;

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fall back
 * on parsing the file as JSON.
 * @param location: Path or url
 */
export const getOpenApiSpec = async (location: string) => {
    const absolutePathOrUrl = (await exists(location)) ? resolve(location) : location;
    const schema = (await $RefParser.bundle(absolutePathOrUrl, absolutePathOrUrl, {})) as OpenApiV2 | OpenApiV3;
    return schema;
};
