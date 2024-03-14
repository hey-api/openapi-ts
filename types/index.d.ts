export declare enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
    NODE = 'node',
    AXIOS = 'axios',
    ANGULAR = 'angular',
}

export declare enum Indent {
    SPACE_4 = '4',
    SPACE_2 = '2',
    TAB = 'tab',
}

export type ServiceResponse = 'body' | 'generics' | 'response';

export type Options = {
    /**
     * Process generated files with autoformatter
     */
    autoformat?: boolean;
    /**
     * Manually set base in OpenAPI config instead of inferring from server value
     */
    base?: string;
    /**
     * Custom client class name
     */
    clientName?: string;
    /**
     * Generate core client classes
     */
    exportCore?: boolean;
    /**
     * Generate models
     */
    exportModels?: boolean | string;
    /**
     * Generate schemas
     */
    exportSchemas?: boolean;
    /**
     * Generate services
     */
    exportServices?: boolean | string;
    /**
     * The selected httpClient (fetch, xhr, node or axios)
     */
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular';
    /**
     * Indentation options (4, 2 or tab)
     */
    indent?: Indent | '4' | '2' | 'tab';
    /**
     * The relative location of the OpenAPI spec
     */
    input: string | Record<string, any>;
    /**
     * The relative location of the output directory
     */
    output: string;
    /**
     * Model name postfix
     */
    postfixModels?: string;
    /**
     * Service name postfix
     */
    postfixServices?: string;
    /**
     * Path to custom request file
     */
    request?: string;
    /**
     * Define shape of returned value from service calls
     */
    serviceResponse?: ServiceResponse;
    /**
     * Output Date instead of string for the format "date-time" in the models
     */
    useDateType?: boolean;
    /**
     * Should the operationId be used when generating operation names?
     */
    useOperationId?: boolean;
    /**
     * Use options or arguments functions
     */
    useOptions?: boolean;
    /**
     * Write the files to disk (true or false)
     */
    write?: boolean;
};

export declare function generate(options: Options): Promise<void>;

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
};

export default OpenAPI;
