import RefParser from 'json-schema-ref-parser';

/**
 * Load and parse te open api spec. If the file extension is ".yml" or ".yaml"
 * we will try to parse the file as a YAML spec, otherwise we will fallback
 * on parsing the file as JSON.
 * @param location: Path or url
 */
export async function getOpenApiSpec(location: string): Promise<any> {
    return await RefParser.bundle(location, location, {});
}
