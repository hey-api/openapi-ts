import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';

export function getMediaType(openApi: OpenApi, content: Dictionary<OpenApiMediaType>): string | null {
    return (
        Object.keys(content).find(key => ['application/json-patch+json', 'application/json', 'text/json', 'text/plain', 'multipart/mixed', 'multipart/related', 'multipart/batch'].includes(key)) ||
        null
    );
}
