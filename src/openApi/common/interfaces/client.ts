export interface ModelComposition extends Pick<Model, '$refs' | 'enums' | 'imports' | 'properties'> {
    export: Extract<Model['export'], 'all-of' | 'any-of' | 'one-of'>;
}

export interface Enum {
    'x-enum-description'?: string;
    'x-enum-varname'?: string;
    description?: string;
    value: string | number;
}

export interface OperationError {
    code: number;
    description: string;
}

export interface OperationParameter extends Model {
    in: 'path' | 'query' | 'header' | 'formData' | 'body' | 'cookie';
    prop: string;
    mediaType: string | null;
}

export interface OperationParameters extends Pick<Model, '$refs' | 'imports'> {
    parameters: OperationParameter[];
    parametersBody: OperationParameter | null;
    parametersCookie: OperationParameter[];
    parametersForm: OperationParameter[];
    parametersHeader: OperationParameter[];
    parametersPath: OperationParameter[];
    parametersQuery: OperationParameter[];
}

export interface OperationResponse extends Model {
    in: 'response' | 'header';
    code: number;
}

export interface Operation extends OperationParameters {
    deprecated: boolean;
    description: string | null;
    errors: OperationError[];
    method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';
    /**
     * Method name. Methods contain the request logic.
     */
    name: string;
    path: string;
    responseHeader: string | null;
    results: OperationResponse[];
    /**
     * Service name, might be without postfix. This will be used to name the
     * exported class.
     */
    service: string;
    summary: string | null;
}

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

export interface Model extends Schema {
    /**
     * **Experimental.** Contains list of original refs so they can be used
     * to access the schema from anywhere instead of relying on string name.
     * This allows us to do things like detect type of ref.
     */
    $refs: string[];
    base: string;
    default?: string;
    deprecated?: boolean;
    description: string | null;
    enum: Enum[];
    enums: Model[];
    export:
        | 'all-of'
        | 'any-of'
        | 'array'
        | 'const'
        | 'dictionary'
        | 'enum'
        | 'generic'
        | 'interface'
        | 'one-of'
        | 'reference';
    imports: string[];
    link: Model | null;
    name: string;
    properties: Model[];
    template: string | null;
    type: string;
}

export interface Service extends Pick<Model, '$refs' | 'imports' | 'name'> {
    operations: Operation[];
}
