import { ClassElement, compiler, filePath, FunctionParameter, generatedFileName, TypeScriptFile } from '../../compiler';
import type { OpenApi, Operation, OperationParameter, Service } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { escapeComment, escapeDescription, escapeName } from '../escape';
import { modelIsRequired } from '../required';
import { unique } from '../unique';

export const serviceExportedNamespace = () => '$OpenApiTs';

const toOperationParamType = (operation: Operation): FunctionParameter[] => {
    const config = getConfig();
    const baseTypePath = `${serviceExportedNamespace()}['${operation.path}']['${operation.method.toLocaleLowerCase()}']['req']`;
    if (!operation.parameters.length) {
        return [];
    }

    if (config.useOptions) {
        const isOptional = operation.parameters.every(p => !p.isRequired);
        return [{ default: isOptional ? {} : undefined, name: 'data', type: baseTypePath }];
    }

    return operation.parameters.map(p => {
        const typePath = `${baseTypePath}['${p.name}']`;
        return {
            default: p?.default,
            isRequired: modelIsRequired(p) === '',
            name: p.name,
            type: typePath,
        };
    });
};

const toOperationReturnType = (operation: Operation) => {
    const config = getConfig();
    const baseTypePath = `${serviceExportedNamespace()}['${operation.path}']['${operation.method.toLocaleLowerCase()}']['res']`;
    const results = operation.results.filter(result => result.code >= 200 && result.code < 300);
    // TODO: we should return nothing when results don't exist
    // can't remove this logic without removing request/name config
    // as it complicates things
    let returnType = compiler.typedef.basic('void');
    if (results.length) {
        const types = results.map(result => `${baseTypePath}[${String(result.code)}]`);
        returnType = compiler.typedef.union(types);
    }
    if (config.useOptions && config.serviceResponse === 'response') {
        returnType = compiler.typedef.basic('ApiResult', [returnType]);
    }
    if (config.client === 'angular') {
        returnType = compiler.typedef.basic('Observable', [returnType]);
    } else {
        returnType = compiler.typedef.basic('CancelablePromise', [returnType]);
    }
    return returnType;
};

const toOperationComment = (operation: Operation) => {
    const config = getConfig();
    let params: string[] = [];
    if (!config.useOptions && operation.parameters.length) {
        params = operation.parameters.map(p => `@param ${p.name} ${p.description ? escapeComment(p.description) : ''}`);
    }
    const comment = [
        operation.deprecated && '@deprecated',
        operation.summary && escapeComment(operation.summary),
        operation.description && escapeComment(operation.description),
        ...params,
        ...operation.results.map(r => `@returns ${r.type} ${r.description ? escapeComment(r.description) : ''}`),
        '@throws ApiError',
    ];
    return comment;
};

const toRequestOptions = (operation: Operation) => {
    const toObj = (parameters: OperationParameter[]) =>
        parameters.reduce(
            (prev, curr) => {
                const key = curr.prop;
                const value = curr.name;
                if (key === value) {
                    prev[key] = key;
                } else if (escapeName(key) === key) {
                    prev[key] = value;
                } else {
                    prev[`'${key}'`] = value;
                }
                return prev;
            },
            {} as Record<string, unknown>
        );

    const obj: Record<string, any> = {
        method: operation.method,
        url: operation.path,
    };
    if (operation.parametersPath.length) {
        obj.path = toObj(operation.parametersPath);
    }
    if (operation.parametersCookie.length) {
        obj.cookies = toObj(operation.parametersCookie);
    }
    if (operation.parametersHeader.length) {
        obj.headers = toObj(operation.parametersHeader);
    }
    if (operation.parametersQuery.length) {
        obj.query = toObj(operation.parametersQuery);
    }
    if (operation.parametersForm.length) {
        obj.formData = toObj(operation.parametersForm);
    }
    if (operation.parametersBody) {
        if (operation.parametersBody.in === 'formData') {
            obj.formData = operation.parametersBody.name;
        }
        if (operation.parametersBody.in === 'body') {
            obj.body = operation.parametersBody.name;
        }
    }
    if (operation.parametersBody?.mediaType) {
        obj.mediaType = operation.parametersBody?.mediaType;
    }
    if (operation.responseHeader) {
        obj.responseHeader = operation.responseHeader;
    }
    if (operation.errors.length) {
        const errors: Record<number, string> = {};
        operation.errors.forEach(err => {
            errors[err.code] = escapeDescription(err.description);
        });
        obj.errors = errors;
    }
    return compiler.types.object({
        identifiers: ['body', 'headers', 'formData', 'cookies', 'path', 'query'],
        obj,
        shorthand: true,
    });
};

export const toDestructuredData = (operation: Operation) => {
    const config = getConfig();
    if (!config.useOptions || !operation.parameters.length) {
        return '';
    }
    const obj: Record<string, unknown> = {};
    operation.parameters.forEach(p => {
        obj[p.name] = p.name;
    });
    const node = compiler.types.object({ identifiers: Object.keys(obj), obj, shorthand: true });
    return `const ${compiler.utils.toString(node)} = data;`;
};

const toOperationStatements = (operation: Operation) => {
    const config = getConfig();
    const statements: any[] = [];
    // If using options we destructor the parameter
    if (config.useOptions && operation.parameters.length) {
        statements.push(compiler.utils.toNode(toDestructuredData(operation)));
    }

    const requestOptions = compiler.utils.toString(toRequestOptions(operation));
    if (config.name) {
        statements.push(compiler.class.return({ args: [requestOptions], name: 'this.httpRequest.request' }));
    } else {
        if (config.client === 'angular') {
            statements.push(
                compiler.class.return({ args: ['OpenAPI', 'this.http', requestOptions], name: '__request' })
            );
        } else {
            statements.push(compiler.class.return({ args: ['OpenAPI', requestOptions], name: '__request' }));
        }
    }
    return statements;
};

export const processService = (service: Service) => {
    const config = getConfig();
    const members: ClassElement[] = service.operations.map(operation => {
        const node = compiler.class.method({
            accessLevel: 'public',
            comment: toOperationComment(operation),
            isStatic: config.name === undefined && config.client !== 'angular',
            name: operation.name,
            parameters: toOperationParamType(operation),
            returnType: toOperationReturnType(operation),
            statements: toOperationStatements(operation),
        });
        return node;
    });

    // Push to front constructor if needed
    if (config.name) {
        members.unshift(
            compiler.class.constructor({
                parameters: [{ accessLevel: 'public', isReadOnly: true, name: 'httpRequest', type: 'BaseHttpRequest' }],
            })
        );
    } else if (config.client === 'angular') {
        members.unshift(
            compiler.class.constructor({
                parameters: [{ accessLevel: 'public', isReadOnly: true, name: 'http', type: 'HttpClient' }],
            })
        );
    }

    return compiler.class.create({
        decorator: config.client === 'angular' ? { args: [{ providedIn: 'root' }], name: 'Injectable' } : undefined,
        members,
        name: `${service.name}${config.postfixServices}`,
    });
};

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 */
export const writeServices = async (openApi: OpenApi, outputPath: string, client: Client): Promise<void> => {
    const config = getConfig();

    const fileServices = new TypeScriptFile({ path: filePath(outputPath, 'services.ts') });

    let imports: string[] = [];

    for (const service of client.services) {
        fileServices.add(processService(service));
        const exported = serviceExportedNamespace();
        imports = [...imports, exported];
    }

    // Import required packages and core files.
    if (config.client === 'angular') {
        fileServices.addNamedImport('Injectable', '@angular/core');
        if (config.name === undefined) {
            fileServices.addNamedImport('HttpClient', '@angular/common/http');
        }
        fileServices.addNamedImport({ isTypeOnly: true, name: 'Observable' }, 'rxjs');
    } else {
        fileServices.addNamedImport({ isTypeOnly: true, name: 'CancelablePromise' }, './core/CancelablePromise');
    }
    if (config.serviceResponse === 'response') {
        fileServices.addNamedImport({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult');
    }
    if (config.name) {
        fileServices.addNamedImport(
            { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
            './core/BaseHttpRequest'
        );
    } else {
        fileServices.addNamedImport('OpenAPI', './core/OpenAPI');
        fileServices.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
    }

    // Import all models required by the services.
    const models = imports.filter(unique).map(imp => ({ isTypeOnly: true, name: imp }));
    fileServices.addNamedImport(models, generatedFileName('./models'));

    if (config.exportServices) {
        fileServices.write('\n\n');
    }
};
