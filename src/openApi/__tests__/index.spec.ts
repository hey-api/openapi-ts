import { afterEach, describe, expect, it, vi } from 'vitest';

import { parse } from '..';
import * as parseV2 from '../v2';
import * as parseV3 from '../v3';

describe('parse', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    const options: Parameters<typeof parse>[1] = {
        client: 'fetch',
        debug: false,
        enums: 'javascript',
        experimental: false,
        exportCore: true,
        exportModels: true,
        exportSchemas: true,
        exportServices: true,
        format: true,
        input: '',
        lint: false,
        operationId: true,
        output: '',
        postfixModels: '',
        postfixServices: '',
        serviceResponse: 'body',
        useDateType: false,
        useOptions: true,
        write: false,
    };

    it('uses v2 parser', () => {
        const spy = vi.spyOn(parseV2, 'parse');

        const spec: Parameters<typeof parse>[0] = {
            info: {
                title: 'dummy',
                version: '1.0',
            },
            paths: {},
            swagger: '2',
        };
        parse(spec, options);
        expect(spy).toHaveBeenCalledWith(spec, options);

        const spec2: Parameters<typeof parse>[0] = {
            info: {
                title: 'dummy',
                version: '1.0',
            },
            paths: {},
            swagger: '2.0',
        };
        parse(spec2, options);
        expect(spy).toHaveBeenCalledWith(spec2, options);
    });

    it('uses v3 parser', () => {
        const spy = vi.spyOn(parseV3, 'parse');

        const spec: Parameters<typeof parse>[0] = {
            info: {
                title: 'dummy',
                version: '1.0',
            },
            openapi: '3',
            paths: {},
        };
        parse(spec, options);
        expect(spy).toHaveBeenCalledWith(spec, options);

        const spec2: Parameters<typeof parse>[0] = {
            info: {
                title: 'dummy',
                version: '1.0',
            },
            openapi: '3.0',
            paths: {},
        };
        parse(spec2, options);
        expect(spy).toHaveBeenCalledWith(spec2, options);

        const spec3: Parameters<typeof parse>[0] = {
            info: {
                title: 'dummy',
                version: '1.0',
            },
            openapi: '3.1.0',
            paths: {},
        };
        parse(spec3, options);
        expect(spy).toHaveBeenCalledWith(spec3, options);
    });

    it('throws on unknown version', () => {
        // @ts-ignore
        expect(() => parse({ foo: 'bar' }, options)).toThrow(
            `Unsupported Open API specification: ${JSON.stringify({ foo: 'bar' }, null, 2)}`
        );
    });
});
