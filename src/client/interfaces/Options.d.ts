import { HttpClient } from '../../HttpClient';
import { Indent } from '../interfaces/Indent';

export interface Options {
    autoformat?: boolean;
    clientName?: string;
    exportCore?: boolean;
    exportModels?: boolean | string;
    exportSchemas?: boolean;
    exportServices?: boolean | string;
    httpClient?: HttpClient;
    indent?: Indent;
    input: string | Record<string, any>;
    output: string;
    postfixModels?: string;
    postfixServices?: string;
    request?: string;
    useDateType?: boolean;
    useOperationId?: boolean;
    useOptions?: boolean;
    useUnionTypes?: boolean;
    write?: boolean;
}
