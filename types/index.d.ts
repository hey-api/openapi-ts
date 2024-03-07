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
    autoformat?: boolean;
    clientName?: string;
    exportCore?: boolean;
    exportModels?: boolean | string;
    exportSchemas?: boolean;
    exportServices?: boolean | string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios' | 'angular';
    indent?: Indent | '4' | '2' | 'tab';
    input: string | Record<string, any>;
    output: string;
    postfixModels?: string;
    postfixServices?: string;
    request?: string;
    serviceResponse?: ServiceResponse;
    useDateType?: boolean;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    write?: boolean;
};

export declare function generate(options: Options): Promise<void>;

declare type OpenAPI = {
    HttpClient: HttpClient;
    Indent: Indent;
    generate: typeof generate;
};

export default OpenAPI;
