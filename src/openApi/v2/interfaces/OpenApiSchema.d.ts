import type { Dictionary } from '../../../utils/types';
import type { WithEnumExtension } from './Extensions/WithEnumExtension';
import type { WithNullableExtension } from './Extensions/WithNullableExtension';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiXml } from './OpenApiXml';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schemaObject
 */
export interface OpenApiSchema extends OpenApiReference, WithEnumExtension, WithNullableExtension {
    title?: string;
    description?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: (string | number)[];
    type?: string;
    format?:
        | 'int32'
        | 'int64'
        | 'float'
        | 'double'
        | 'string'
        | 'boolean'
        | 'byte'
        | 'binary'
        | 'date'
        | 'date-time'
        | 'password';
    items?: OpenApiSchema;
    allOf?: OpenApiSchema[];
    properties?: Dictionary<OpenApiSchema>;
    additionalProperties?: boolean | OpenApiSchema;
    discriminator?: string;
    readOnly?: boolean;
    xml?: OpenApiXml;
    externalDocs?: OpenApiExternalDocs;
    example?: any;
}
