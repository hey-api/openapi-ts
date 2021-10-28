import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';

const supportedMediaTypes = [
    'application/json-patch+json',
    'application/json',
    'text/json',
    'text/plain',
    'multipart/form-data',
    'multipart/mixed',
    'multipart/related',
    'multipart/batch',
];

export function getMediaType(openApi: OpenApi, content: Dictionary<OpenApiMediaType>): string | null {
    return Object.keys(content).find(key => supportedMediaTypes.includes(key)) || null;
}
