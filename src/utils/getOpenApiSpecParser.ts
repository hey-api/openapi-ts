import { parse as parseV2 } from '../openApi/v2';
import { parse as parseV3 } from '../openApi/v3';

type SupportedMajorVersions = '2' | '3';

/**
 * @param openApi The loaded spec
 */
export const getOpenApiSpecParser = (openApi: Record<string, any>): typeof parseV2 | typeof parseV3 => {
    const versionString = openApi.swagger || openApi.openapi;
    if (typeof versionString === 'string') {
        const versionMajor = versionString.charAt(0) as SupportedMajorVersions;
        switch (versionMajor) {
            case '2':
                return parseV2;
            case '3':
                return parseV3;
            default:
                break;
        }
    }
    throw new Error(`Unsupported Open API version: "${String(versionString)}"`);
};
