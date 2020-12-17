// @ts-ignore
import httpntlm from 'httpntlm';
import { promisify } from 'util';
import { stringify } from 'qs';

type TRequestOptions = {
    readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';
    readonly path: string;
    readonly cookies?: Record<string, any>;
    readonly headers?: Record<string, any>;
    readonly query?: Record<string, any>;
    readonly formData?: Record<string, any>;
    readonly body?: any;
    readonly responseHeader?: string;
    readonly errors?: Record<number, string>;
}

type TResult = {
    readonly url: string;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly body: any;
}

export async function request(options: TRequestOptions): Promise<TResult> {

    const path = options.path.replace(/[:]/g, '_');
    const query = stringify(options.query);
    const host = 'http://localhost:8080';
    const url = `${host}${path}${query}`;

    const body = options.body && JSON.stringify(options.body);
    const headers = {
        ...options.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': 'identity',
    }

    const method = options.method.toLowerCase();
    const fetch = promisify(httpntlm[method]);

    const response = await fetch({
        url,
        domain: 'domain',
        username: 'username',
        password: 'password',
        headers,
        body,
    });

    return {
        url,
        ok: response.ok,
        status: response.statusCode,
        statusText: response.statusText,
        body: JSON.parse(response.body),
    };
}
