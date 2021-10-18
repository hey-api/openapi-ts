import { isDefined } from '../../../utils/isDefined';
import type { Dictionary } from '../../../utils/types';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export function getContent(openApi: OpenApi, content: Dictionary<OpenApiMediaType>): OpenApiSchema | null {
    const basicMediaTypeSchema =
        content['application/json-patch+json']?.schema ||
        content['application/json']?.schema ||
        content['text/json']?.schema ||
        content['text/plain']?.schema ||
        content['multipart/mixed']?.schema ||
        content['multipart/related']?.schema ||
        content['multipart/batch']?.schema;

    if (basicMediaTypeSchema) {
        return basicMediaTypeSchema;
    }

    const mediaTypes = Object.values(content);
    const mediaType = mediaTypes.find(mediaType => isDefined(mediaType.schema));
    return mediaType?.schema || null;
}
