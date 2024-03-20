export interface UserConfig {
    /**
     * Process generated files with autoformatter
     * @default true
     */
    autoformat?: boolean;
    /**
     * Manually set base in OpenAPI config instead of inferring from server value
     */
    base?: string;
    /**
     * The selected HTTP client (fetch, xhr, node or axios)
     * @default 'fetch'
     */
    client?: 'angular' | 'axios' | 'fetch' | 'node' | 'xhr';
    /**
     * Generate JavaScript objects from enum definitions
     * @default false
     */
    enums?: boolean;
    /**
     * Generate core client classes
     * @default true
     */
    exportCore?: boolean;
    /**
     * Generate models
     * @default true
     */
    exportModels?: boolean | string;
    /**
     * Generate schemas
     * @default false
     */
    exportSchemas?: boolean;
    /**
     * Generate services
     * @default true
     */
    exportServices?: boolean | string;
    /**
     * The relative location of the OpenAPI spec
     */
    input: string | Record<string, unknown>;
    /**
     * Custom client class name
     */
    name?: string;
    /**
     * Use operation ID to generate operation names?
     * @default true
     */
    operationId?: boolean;
    /**
     * The relative location of the output directory
     */
    output: string;
    /**
     * Model name postfix
     * @default '''
     */
    postfixModels?: string;
    /**
     * Service name postfix
     * @default 'Service'
     */
    postfixServices?: string;
    /**
     * Path to custom request file
     */
    request?: string;
    /**
     * Define shape of returned value from service calls
     * @default 'body'
     */
    serviceResponse?: 'body' | 'generics' | 'response';
    /**
     * Output Date instead of string for the format "date-time" in the models
     * @default false
     */
    useDateType?: boolean;
    /**
     * Use options or arguments functions
     * @default false
     */
    useOptions?: boolean;
    /**
     * Write the files to disk (true or false)
     * @default true
     */
    write?: boolean;
}

export type Config = Omit<Required<UserConfig>, 'base' | 'name' | 'request'> &
    Pick<UserConfig, 'base' | 'name' | 'request'>;
