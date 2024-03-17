import type { OpenApi as OpenApiV2 } from '../../openApi/v2/interfaces/OpenApi';
import type { OpenApi as OpenApiV3 } from '../../openApi/v3/interfaces/OpenApi';

export type ServiceResponse = 'body' | 'generics' | 'response';

export interface Options {
    /**
     * Process generated files with formatter?
     */
    autoformat?: boolean;
    /**
     * Manually set base in OpenAPI config instead of inferring from server value
     */
    base?: string;
    /**
     * The selected HTTP client (fetch, xhr, node or axios)
     */
    client?: 'angular' | 'axios' | 'fetch' | 'node' | 'xhr';
    /**
     * Custom client class name
     */
    clientName?: string;
    /**
     * Generate JavaScript objects from enum definitions
     */
    enums?: boolean;
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
     * The relative location of the OpenAPI spec
     */
    input: string | OpenApiV2 | OpenApiV3;
    /**
     * Use operation ID to generate operation names?
     */
    operationId?: boolean;
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
     * Use options or arguments functions
     */
    useOptions?: boolean;
    /**
     * Write the files to disk (true or false)
     */
    write?: boolean;
}
