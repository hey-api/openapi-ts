export interface Schema {
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
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
    isDefinition: boolean;
    isNullable: boolean;
    isReadOnly: boolean;
    isRequired: boolean;
    maximum?: number;
    maxItems?: number;
    maxLength?: number;
    maxProperties?: number;
    minimum?: number;
    minItems?: number;
    minLength?: number;
    minProperties?: number;
    multipleOf?: number;
    pattern?: string;
    uniqueItems?: boolean;
}
