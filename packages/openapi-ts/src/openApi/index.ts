import type { Client } from '../types/client';
import { OpenApi } from './common/interfaces/OpenApi';
import { parse as parseV2 } from './v2/index';
import { parse as parseV3 } from './v3/index';

export { Enum, Model, Operation, OperationParameter, Service } from './common/interfaces/client';
export { OpenApi } from './common/interfaces/OpenApi';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param openApi The OpenAPI spec that we have loaded from disk.
 */
export function parse(openApi: OpenApi): Client {
    if ('openapi' in openApi) {
        return parseV3(openApi);
    }

    if ('swagger' in openApi) {
        return parseV2(openApi);
    }

    throw new Error(`Unsupported Open API specification: ${JSON.stringify(openApi, null, 2)}`);
}
