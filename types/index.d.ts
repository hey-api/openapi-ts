export declare enum HttpClient {
    FETCH = 'fetch',
    XHR = 'xhr',
    NODE = 'node',
    AXIOS = 'axios',
}

export type Options = {
    input: string | Record<string, any>;
    output: string;
    httpClient?: HttpClient | 'fetch' | 'xhr' | 'node' | 'axios';
    useOptions?: boolean;
    useUnionTypes?: boolean;
    exportCore?: boolean;
    exportServices?: boolean;
    exportModels?: boolean;
    exportSchemas?: boolean;
    request?: string;
    write?: boolean;
};

export declare function generate(options: Options): Promise<void>;

export default {
    HttpClient,
    generate,
};
