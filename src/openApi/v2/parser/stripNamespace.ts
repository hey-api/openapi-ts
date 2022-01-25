/**
 * Strip (OpenAPI) namespaces fom values.
 * @param value
 */
export const stripNamespace = (value: string): string => {
    return value
        .trim()
        .replace(/^#\/definitions\//, '')
        .replace(/^#\/parameters\//, '')
        .replace(/^#\/responses\//, '')
        .replace(/^#\/securityDefinitions\//, '');
};
