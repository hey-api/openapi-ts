import RefParser from '@apidevtools/json-schema-ref-parser';
import { exists } from 'fs-extra';
import path from 'path';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fall back
 * on parsing the file as JSON.
 * @param location: Path or url
 */
export const getOpenApiSpec = async (location: string): Promise<any> => {
    const absolutePathOrUrl = (await exists(location)) ? path.resolve(location) : location;
    return await RefParser.bundle(absolutePathOrUrl, absolutePathOrUrl, {});
};
