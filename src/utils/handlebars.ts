import camelCase from 'camelcase';
import Handlebars from 'handlebars/runtime';
import { EOL } from 'os';

import type { Model, OperationParameter, Service } from '../openApi';
import templateClient from '../templates/client.hbs';
import angularGetHeaders from '../templates/core/angular/getHeaders.hbs';
import angularGetRequestBody from '../templates/core/angular/getRequestBody.hbs';
import angularGetResponseBody from '../templates/core/angular/getResponseBody.hbs';
import angularGetResponseHeader from '../templates/core/angular/getResponseHeader.hbs';
import angularRequest from '../templates/core/angular/request.hbs';
import angularSendRequest from '../templates/core/angular/sendRequest.hbs';
import templateCoreApiError from '../templates/core/ApiError.hbs';
import templateCoreApiRequestOptions from '../templates/core/ApiRequestOptions.hbs';
import templateCoreApiResult from '../templates/core/ApiResult.hbs';
import axiosGetHeaders from '../templates/core/axios/getHeaders.hbs';
import axiosGetRequestBody from '../templates/core/axios/getRequestBody.hbs';
import axiosGetResponseBody from '../templates/core/axios/getResponseBody.hbs';
import axiosGetResponseHeader from '../templates/core/axios/getResponseHeader.hbs';
import axiosRequest from '../templates/core/axios/request.hbs';
import axiosSendRequest from '../templates/core/axios/sendRequest.hbs';
import templateCoreBaseHttpRequest from '../templates/core/BaseHttpRequest.hbs';
import templateCancelablePromise from '../templates/core/CancelablePromise.hbs';
import fetchGetHeaders from '../templates/core/fetch/getHeaders.hbs';
import fetchGetRequestBody from '../templates/core/fetch/getRequestBody.hbs';
import fetchGetResponseBody from '../templates/core/fetch/getResponseBody.hbs';
import fetchGetResponseHeader from '../templates/core/fetch/getResponseHeader.hbs';
import fetchRequest from '../templates/core/fetch/request.hbs';
import fetchSendRequest from '../templates/core/fetch/sendRequest.hbs';
import functionBase64 from '../templates/core/functions/base64.hbs';
import functionCatchErrorCodes from '../templates/core/functions/catchErrorCodes.hbs';
import functionGetFormData from '../templates/core/functions/getFormData.hbs';
import functionGetQueryString from '../templates/core/functions/getQueryString.hbs';
import functionGetUrl from '../templates/core/functions/getUrl.hbs';
import functionIsBlob from '../templates/core/functions/isBlob.hbs';
import functionIsFormData from '../templates/core/functions/isFormData.hbs';
import functionIsString from '../templates/core/functions/isString.hbs';
import functionIsStringWithValue from '../templates/core/functions/isStringWithValue.hbs';
import functionIsSuccess from '../templates/core/functions/isSuccess.hbs';
import functionResolve from '../templates/core/functions/resolve.hbs';
import templateCoreHttpRequest from '../templates/core/HttpRequest.hbs';
import nodeGetHeaders from '../templates/core/node/getHeaders.hbs';
import nodeGetRequestBody from '../templates/core/node/getRequestBody.hbs';
import nodeGetResponseBody from '../templates/core/node/getResponseBody.hbs';
import nodeGetResponseHeader from '../templates/core/node/getResponseHeader.hbs';
import nodeRequest from '../templates/core/node/request.hbs';
import nodeSendRequest from '../templates/core/node/sendRequest.hbs';
import templateCoreSettings from '../templates/core/OpenAPI.hbs';
import templateCoreRequest from '../templates/core/request.hbs';
import templateCoreTypes from '../templates/core/types.hbs';
import xhrGetHeaders from '../templates/core/xhr/getHeaders.hbs';
import xhrGetRequestBody from '../templates/core/xhr/getRequestBody.hbs';
import xhrGetResponseBody from '../templates/core/xhr/getResponseBody.hbs';
import xhrGetResponseHeader from '../templates/core/xhr/getResponseHeader.hbs';
import xhrRequest from '../templates/core/xhr/request.hbs';
import xhrSendRequest from '../templates/core/xhr/sendRequest.hbs';
import templateExportModel from '../templates/exportModel.hbs';
import templateExportSchema from '../templates/exportSchema.hbs';
import templateExportService from '../templates/exportService.hbs';
import templateIndex from '../templates/index.hbs';
import partialBase from '../templates/partials/base.hbs';
import partialDataDestructure from '../templates/partials/dataDestructure.hbs';
import partialExportComposition from '../templates/partials/exportComposition.hbs';
import partialExportEnum from '../templates/partials/exportEnum.hbs';
import partialExportInterface from '../templates/partials/exportInterface.hbs';
import partialExportType from '../templates/partials/exportType.hbs';
import partialIsNullable from '../templates/partials/isNullable.hbs';
import partialIsReadOnly from '../templates/partials/isReadOnly.hbs';
import partialIsRequired from '../templates/partials/isRequired.hbs';
import partialOperationParameters from '../templates/partials/operationParameters.hbs';
import partialOperationResult from '../templates/partials/operationResult.hbs';
import partialOperationTypes from '../templates/partials/operationTypes.hbs';
import partialRequestConfig from '../templates/partials/requestConfig.hbs';
import partialSchema from '../templates/partials/schema.hbs';
import partialSchemaArray from '../templates/partials/schemaArray.hbs';
import partialSchemaComposition from '../templates/partials/schemaComposition.hbs';
import partialSchemaDictionary from '../templates/partials/schemaDictionary.hbs';
import partialSchemaEnum from '../templates/partials/schemaEnum.hbs';
import partialSchemaGeneric from '../templates/partials/schemaGeneric.hbs';
import partialSchemaInterface from '../templates/partials/schemaInterface.hbs';
import partialType from '../templates/partials/type.hbs';
import partialTypeArray from '../templates/partials/typeArray.hbs';
import partialTypeDictionary from '../templates/partials/typeDictionary.hbs';
import partialTypeEnum from '../templates/partials/typeEnum.hbs';
import partialTypeGeneric from '../templates/partials/typeGeneric.hbs';
import partialTypeInterface from '../templates/partials/typeInterface.hbs';
import partialTypeIntersection from '../templates/partials/typeIntersection.hbs';
import partialTypeReference from '../templates/partials/typeReference.hbs';
import partialTypeUnion from '../templates/partials/typeUnion.hbs';
import type { Client } from '../types/client';
import type { Config } from '../types/config';
import { enumKey, enumName, enumUnionType, enumValue } from './enum';
import { escapeName } from './escapeName';
import { sortByName } from './sort';
import { unique } from './unique';

const escapeComment = (value: string) =>
    value
        .replace(/\*\//g, '*')
        .replace(/\/\*/g, '*')
        .replace(/\r?\n(.*)/g, (_, w) => `${EOL} * ${w.trim()}`);

const modelImports = (model: Service, path: string) => {
    if (model.imports.length === 0) {
        return '';
    }
    return `import type { ${model.imports.join(',')} } from '${path}';`;
};

const dataParameters = (parameters: OperationParameter[]) => {
    const output = parameters.map(parameter => {
        const key = parameter.prop;
        const value = parameter.name;
        if (key === value) {
            return key;
        }
        if (escapeName(key) === key) {
            return `${key}: ${value}`;
        }
        return `'${key}': ${value}`;
    });
    return output.join(', ');
};

// same as `>isRequired` partial
const isRequired = (model: Pick<Model, 'default' | 'isRequired'>) => (model.isRequired && !model.default ? '' : '?');

const nameOperationDataType = (value: string) => camelCase(['T', 'Data', value].join('-'), { pascalCase: true });

const operationDataType = (config: Config, service: Service) => {
    if (!config.useOptions) {
        return '';
    }
    const partialType = Handlebars.partials['type'];
    const output = service.operations
        .filter(operation => operation.parameters.length)
        .map(operation => {
            const name = nameOperationDataType(operation.name);
            return `export type ${name} = {
                ${sortByName(operation.parameters)
                    .map(parameter => {
                        let comment: string[] = [];
                        if (parameter.description) {
                            comment = ['/**', ` * ${escapeComment(parameter.description)}`, ' */'];
                        }
                        return [
                            ...comment,
                            `${parameter.name + isRequired(parameter)}: ${partialType({ $config: config, ...parameter })}`,
                        ].join('\n');
                    })
                    .join('\n')}
            }`;
        });
    return output.join('\n');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const registerHandlebarHelpers = (config: Config, client: Client): void => {
    Handlebars.registerHelper('camelCase', camelCase);
    Handlebars.registerHelper('dataParameters', dataParameters);
    Handlebars.registerHelper('enumKey', enumKey);
    Handlebars.registerHelper('enumName', enumName);
    Handlebars.registerHelper('enumUnionType', enumUnionType);
    Handlebars.registerHelper('enumValue', enumValue);

    Handlebars.registerHelper(
        'equals',
        function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions) {
            return a === b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper('escapeComment', escapeComment);

    Handlebars.registerHelper('escapeDescription', function (value: string) {
        return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
    });

    Handlebars.registerHelper('escapeNewline', function (value: string) {
        return value.replace(/\n/g, '\\n');
    });

    Handlebars.registerHelper('exactArray', function (this: unknown, model: Model, options: Handlebars.HelperOptions) {
        if (model.export === 'array' && model.maxItems && model.minItems && model.maxItems === model.minItems) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('ifdef', function (this: unknown, ...args): string {
        const options = args.pop();
        if (!args.every(value => !value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper(
        'ifOperationDataOptional',
        function (this: unknown, parameters: OperationParameter[], options: Handlebars.HelperOptions) {
            return parameters.every(parameter => !parameter.isRequired) ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper(
        'intersection',
        function (this: unknown, models: Model[], parent: string | undefined, options: Handlebars.HelperOptions) {
            const partialType = Handlebars.partials['type'];
            const types = models.map(model => partialType({ $config: config, ...model, parent }));
            const uniqueTypes = types.filter(unique);
            let uniqueTypesString = uniqueTypes.join(' & ');
            if (uniqueTypes.length > 1) {
                uniqueTypesString = `(${uniqueTypesString})`;
            }
            return options.fn(uniqueTypesString);
        }
    );

    Handlebars.registerHelper('modelImports', modelImports);

    Handlebars.registerHelper(
        'modelUnionType',
        function (models: Model[], parent: string | undefined, filterProperties: 'exact' | undefined) {
            const partialType = Handlebars.partials['type'];
            const types = models
                .map(model => partialType({ $config: config, ...model, parent }))
                .filter((...args) => filterProperties === 'exact' || unique(...args));
            const union = types.join(filterProperties === 'exact' ? ', ' : ' | ');
            return types.length > 1 && types.length !== models.length ? `(${union})` : union;
        }
    );

    Handlebars.registerHelper('nameOperationDataType', nameOperationDataType);

    Handlebars.registerHelper(
        'notEquals',
        function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions) {
            return a !== b ? options.fn(this) : options.inverse(this);
        }
    );

    Handlebars.registerHelper('operationDataType', function (service: Service) {
        return operationDataType(config, service);
    });

    Handlebars.registerHelper(
        'useDateType',
        function (this: unknown, config: Config, format: string | undefined, options: Handlebars.HelperOptions) {
            return config.useDateType && format === 'date-time' ? options.fn(this) : options.inverse(this);
        }
    );
};

export interface Templates {
    client: Handlebars.TemplateDelegate;
    core: {
        apiError: Handlebars.TemplateDelegate;
        apiRequestOptions: Handlebars.TemplateDelegate;
        apiResult: Handlebars.TemplateDelegate;
        baseHttpRequest: Handlebars.TemplateDelegate;
        cancelablePromise: Handlebars.TemplateDelegate;
        httpRequest: Handlebars.TemplateDelegate;
        request: Handlebars.TemplateDelegate;
        settings: Handlebars.TemplateDelegate;
        types: Handlebars.TemplateDelegate;
    };
    exports: {
        model: Handlebars.TemplateDelegate;
        schema: Handlebars.TemplateDelegate;
        service: Handlebars.TemplateDelegate;
    };
    index: Handlebars.TemplateDelegate;
}

/**
 * Read all the Handlebar templates that we need and return a wrapper object
 * so we can easily access the templates in our generator/write functions.
 */
export const registerHandlebarTemplates = (config: Config, client: Client): Templates => {
    registerHandlebarHelpers(config, client);

    // Main templates (entry points for the files we write to disk)
    const templates: Templates = {
        client: Handlebars.template(templateClient),
        core: {
            apiError: Handlebars.template(templateCoreApiError),
            apiRequestOptions: Handlebars.template(templateCoreApiRequestOptions),
            apiResult: Handlebars.template(templateCoreApiResult),
            baseHttpRequest: Handlebars.template(templateCoreBaseHttpRequest),
            cancelablePromise: Handlebars.template(templateCancelablePromise),
            httpRequest: Handlebars.template(templateCoreHttpRequest),
            request: Handlebars.template(templateCoreRequest),
            settings: Handlebars.template(templateCoreSettings),
            types: Handlebars.template(templateCoreTypes),
        },
        exports: {
            model: Handlebars.template(templateExportModel),
            schema: Handlebars.template(templateExportSchema),
            service: Handlebars.template(templateExportService),
        },
        index: Handlebars.template(templateIndex),
    };

    // Partials for the generations of the models, services, etc.
    Handlebars.registerPartial('base', Handlebars.template(partialBase));
    Handlebars.registerPartial('dataDestructure', Handlebars.template(partialDataDestructure));
    Handlebars.registerPartial('exportComposition', Handlebars.template(partialExportComposition));
    Handlebars.registerPartial('exportEnum', Handlebars.template(partialExportEnum));
    Handlebars.registerPartial('exportInterface', Handlebars.template(partialExportInterface));
    Handlebars.registerPartial('exportType', Handlebars.template(partialExportType));
    Handlebars.registerPartial('isNullable', Handlebars.template(partialIsNullable));
    Handlebars.registerPartial('isReadOnly', Handlebars.template(partialIsReadOnly));
    Handlebars.registerPartial('isRequired', Handlebars.template(partialIsRequired));
    Handlebars.registerPartial('operationParameters', Handlebars.template(partialOperationParameters));
    Handlebars.registerPartial('operationResult', Handlebars.template(partialOperationResult));
    Handlebars.registerPartial('operationTypes', Handlebars.template(partialOperationTypes));
    Handlebars.registerPartial('requestConfig', Handlebars.template(partialRequestConfig));
    Handlebars.registerPartial('schema', Handlebars.template(partialSchema));
    Handlebars.registerPartial('schemaArray', Handlebars.template(partialSchemaArray));
    Handlebars.registerPartial('schemaComposition', Handlebars.template(partialSchemaComposition));
    Handlebars.registerPartial('schemaDictionary', Handlebars.template(partialSchemaDictionary));
    Handlebars.registerPartial('schemaEnum', Handlebars.template(partialSchemaEnum));
    Handlebars.registerPartial('schemaGeneric', Handlebars.template(partialSchemaGeneric));
    Handlebars.registerPartial('schemaInterface', Handlebars.template(partialSchemaInterface));
    Handlebars.registerPartial('type', Handlebars.template(partialType));
    Handlebars.registerPartial('typeArray', Handlebars.template(partialTypeArray));
    Handlebars.registerPartial('typeDictionary', Handlebars.template(partialTypeDictionary));
    Handlebars.registerPartial('typeEnum', Handlebars.template(partialTypeEnum));
    Handlebars.registerPartial('typeGeneric', Handlebars.template(partialTypeGeneric));
    Handlebars.registerPartial('typeInterface', Handlebars.template(partialTypeInterface));
    Handlebars.registerPartial('typeIntersection', Handlebars.template(partialTypeIntersection));
    Handlebars.registerPartial('typeReference', Handlebars.template(partialTypeReference));
    Handlebars.registerPartial('typeUnion', Handlebars.template(partialTypeUnion));

    // Generic functions used in 'request' file @see src/templates/core/request.hbs for more info
    Handlebars.registerPartial('functions/base64', Handlebars.template(functionBase64));
    Handlebars.registerPartial('functions/catchErrorCodes', Handlebars.template(functionCatchErrorCodes));
    Handlebars.registerPartial('functions/getFormData', Handlebars.template(functionGetFormData));
    Handlebars.registerPartial('functions/getQueryString', Handlebars.template(functionGetQueryString));
    Handlebars.registerPartial('functions/getUrl', Handlebars.template(functionGetUrl));
    Handlebars.registerPartial('functions/isBlob', Handlebars.template(functionIsBlob));
    Handlebars.registerPartial('functions/isFormData', Handlebars.template(functionIsFormData));
    Handlebars.registerPartial('functions/isString', Handlebars.template(functionIsString));
    Handlebars.registerPartial('functions/isStringWithValue', Handlebars.template(functionIsStringWithValue));
    Handlebars.registerPartial('functions/isSuccess', Handlebars.template(functionIsSuccess));
    Handlebars.registerPartial('functions/resolve', Handlebars.template(functionResolve));

    // Specific files for the fetch client implementation
    Handlebars.registerPartial('fetch/getHeaders', Handlebars.template(fetchGetHeaders));
    Handlebars.registerPartial('fetch/getRequestBody', Handlebars.template(fetchGetRequestBody));
    Handlebars.registerPartial('fetch/getResponseBody', Handlebars.template(fetchGetResponseBody));
    Handlebars.registerPartial('fetch/getResponseHeader', Handlebars.template(fetchGetResponseHeader));
    Handlebars.registerPartial('fetch/request', Handlebars.template(fetchRequest));
    Handlebars.registerPartial('fetch/sendRequest', Handlebars.template(fetchSendRequest));

    // Specific files for the xhr client implementation
    Handlebars.registerPartial('xhr/getHeaders', Handlebars.template(xhrGetHeaders));
    Handlebars.registerPartial('xhr/getRequestBody', Handlebars.template(xhrGetRequestBody));
    Handlebars.registerPartial('xhr/getResponseBody', Handlebars.template(xhrGetResponseBody));
    Handlebars.registerPartial('xhr/getResponseHeader', Handlebars.template(xhrGetResponseHeader));
    Handlebars.registerPartial('xhr/request', Handlebars.template(xhrRequest));
    Handlebars.registerPartial('xhr/sendRequest', Handlebars.template(xhrSendRequest));

    // Specific files for the node client implementation
    Handlebars.registerPartial('node/getHeaders', Handlebars.template(nodeGetHeaders));
    Handlebars.registerPartial('node/getRequestBody', Handlebars.template(nodeGetRequestBody));
    Handlebars.registerPartial('node/getResponseBody', Handlebars.template(nodeGetResponseBody));
    Handlebars.registerPartial('node/getResponseHeader', Handlebars.template(nodeGetResponseHeader));
    Handlebars.registerPartial('node/request', Handlebars.template(nodeRequest));
    Handlebars.registerPartial('node/sendRequest', Handlebars.template(nodeSendRequest));

    // Specific files for the axios client implementation
    Handlebars.registerPartial('axios/getHeaders', Handlebars.template(axiosGetHeaders));
    Handlebars.registerPartial('axios/getRequestBody', Handlebars.template(axiosGetRequestBody));
    Handlebars.registerPartial('axios/getResponseBody', Handlebars.template(axiosGetResponseBody));
    Handlebars.registerPartial('axios/getResponseHeader', Handlebars.template(axiosGetResponseHeader));
    Handlebars.registerPartial('axios/request', Handlebars.template(axiosRequest));
    Handlebars.registerPartial('axios/sendRequest', Handlebars.template(axiosSendRequest));

    // Specific files for the angular client implementation
    Handlebars.registerPartial('angular/getHeaders', Handlebars.template(angularGetHeaders));
    Handlebars.registerPartial('angular/getRequestBody', Handlebars.template(angularGetRequestBody));
    Handlebars.registerPartial('angular/getResponseBody', Handlebars.template(angularGetResponseBody));
    Handlebars.registerPartial('angular/getResponseHeader', Handlebars.template(angularGetResponseHeader));
    Handlebars.registerPartial('angular/request', Handlebars.template(angularRequest));
    Handlebars.registerPartial('angular/sendRequest', Handlebars.template(angularSendRequest));

    return templates;
};
