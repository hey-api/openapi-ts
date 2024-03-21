import type { Client } from '../types/client';
import type { Config } from '../types/config';
import { OpenApi } from './common/interfaces/OpenApi';
import { parse as parseV2 } from './v2/index';
import { parse as parseV3 } from './v3/index';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec that we have loaded from disk.
 * @param options {@link Config} passed to the `createClient()` method
 */
export function parse(openApi: OpenApi, config: Config): Client {
    if ('openapi' in openApi) {
        return parseV3(openApi, config);
    } else if ('swagger' in openApi) {
        return parseV2(openApi, config);
    }
    throw new Error(`Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`);
}
