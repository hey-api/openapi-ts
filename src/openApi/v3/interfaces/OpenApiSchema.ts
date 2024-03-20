import type { WithEnumExtension } from '../../../types/client';
import type { Dictionary } from '../../../utils/types';
import type { OpenApiDiscriminator } from './OpenApiDiscriminator';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiXml } from './OpenApiXml';

/**
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#schemaObject
 */
export interface OpenApiSchema extends OpenApiReference, WithEnumExtension {
    additionalProperties?: boolean | OpenApiSchema;
    allOf?: OpenApiSchema[];
    anyOf?: OpenApiSchema[];
    const?: string | number | boolean | null;
    default?: number;
    deprecated?: boolean;
    description?: string;
    discriminator?: OpenApiDiscriminator;
    enum?: (string | number)[];
    example?: unknown;
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
    externalDocs?: OpenApiExternalDocs;
    format?:
        | 'binary'
        | 'boolean'
        | 'byte'
        | 'date-time'
        | 'date'
        | 'double'
        | 'float'
        | 'int32'
        | 'int64'
        | 'password'
        | 'string';
    items?: OpenApiSchema;
    maximum?: number;
    maxItems?: number;
    maxLength?: number;
    maxProperties?: number;
    minimum?: number;
    minItems?: number;
    minLength?: number;
    minProperties?: number;
    multipleOf?: number;
    not?: OpenApiSchema[];
    nullable?: boolean;
    oneOf?: OpenApiSchema[];
    pattern?: string;
    properties?: Dictionary<OpenApiSchema>;
    readOnly?: boolean;
    required?: string[];
    title?: string;
    type?: string | string[];
    uniqueItems?: boolean;
    writeOnly?: boolean;
    xml?: OpenApiXml;
}
