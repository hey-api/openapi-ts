import type { IR } from '@hey-api/shared';
import { toCase } from '@hey-api/shared';

import type { $ } from '../../../../py-dsl';
// import { py } from '../../../../ts-python';
import type { HeyApiSdkPlugin } from '../types';
import { getSignatureParameters } from './signature';

type OperationParameters = {
  bodyRef?: string;
  parameters: Array<ReturnType<typeof $.param>>;
  // parameters: Array<{
  //   annotation?: py.Expression;
  //   defaultValue?: py.Expression;
  //   name: string;
  // }>;
};

const PYTHON_BUILTIN_TYPES: Record<string, string> = {
  array: 'list',
  boolean: 'bool',
  integer: 'int',
  number: 'float',
  object: 'dict',
  string: 'str',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function schemaToPythonType(schema: IR.SchemaObject, plugin: HeyApiSdkPlugin['Instance']): string {
  if (schema.$ref) {
    return toCase(schema.$ref.split('/').pop()!, 'PascalCase');
  }

  if (schema.type === 'array') {
    const itemsSchema = schema.items as IR.SchemaObject | undefined;
    const itemType = itemsSchema ? schemaToPythonType(itemsSchema, plugin) : 'Any';
    return `list[${itemType}]`;
  }

  if (schema.type === 'object' || schema.additionalProperties) {
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const valueType = schemaToPythonType(schema.additionalProperties as IR.SchemaObject, plugin);
      return `dict[str, ${valueType}]`;
    }
    return 'dict[str, Any]';
  }

  if (schema.type === 'tuple') {
    const itemsSchema = schema.items as IR.SchemaObject | IR.SchemaObject[] | undefined;
    const itemTypes = itemsSchema
      ? Array.isArray(itemsSchema)
        ? itemsSchema.map((item) => schemaToPythonType(item, plugin))
        : [schemaToPythonType(itemsSchema, plugin)]
      : [];
    return `tuple[${itemTypes.join(', ')}]`;
  }

  const builtinType = schema.type ? PYTHON_BUILTIN_TYPES[schema.type] : 'Any';
  return builtinType ?? 'Any';
}

export function operationParameters({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): OperationParameters {
  const result: OperationParameters = {
    parameters: [],
  };

  if (plugin.config.paramsStructure === 'flat') {
    const signature = getSignatureParameters({ operation });
    if (!signature) return result;

    // result.bodyRef = signature.bodyRef;

    // for (const param of opParameters.parameters) {
    //   if (param.name === '*') {
    //     continue;
    //   }
    //   node.param(param.name, (p) => p.type(param.annotation).default(param.defaultValue));
    // }

    // const pathParams: OperationParameters['parameters'] = [];
    // const requiredParams: OperationParameters['parameters'] = [];
    // const optionalParams: OperationParameters['parameters'] = [];

    // const paramNames = Object.keys(signature.parameters);

    // for (const paramName of paramNames) {
    //   const param = signature.parameters[paramName]!;

    //   if (param.in === 'path') {
    //     const type = schemaToPythonType(param.schema, plugin);
    //     pathParams.push({
    //       annotation: py.factory.createIdentifier(type),
    //       name: param.name,
    //     });
    //     continue;
    //   }

    //   if (param.in === 'body' && param.schema.$ref) {
    //     const refName = toCase(param.schema.$ref.split('/').pop()!, 'PascalCase');
    //     if (param.isRequired) {
    //       requiredParams.push({
    //         annotation: py.factory.createIdentifier(refName),
    //         name: param.name,
    //       });
    //     } else {
    //       optionalParams.push({
    //         annotation: py.factory.createIdentifier(`${refName} | None`),
    //         defaultValue: py.factory.createLiteral(null),
    //         name: param.name,
    //       });
    //     }
    //     continue;
    //   }

    //   const type = schemaToPythonType(param.schema, plugin);

    //   if (param.isRequired) {
    //     requiredParams.push({
    //       annotation: py.factory.createIdentifier(type),
    //       name: param.name,
    //     });
    //   } else {
    //     let defaultValue: py.Expression = py.factory.createLiteral(null);
    //     if (param.schema.default !== undefined) {
    //       const defaultVal = param.schema.default;
    //       if (
    //         typeof defaultVal === 'string' ||
    //         typeof defaultVal === 'number' ||
    //         typeof defaultVal === 'boolean'
    //       ) {
    //         defaultValue = py.factory.createLiteral(defaultVal);
    //       } else {
    //         defaultValue = py.factory.createLiteral(null);
    //       }
    //     } else if (type.startsWith('list') || type.startsWith('dict')) {
    //       defaultValue = py.factory.createLiteral(null);
    //     }

    //     optionalParams.push({
    //       annotation: py.factory.createIdentifier(`${type} | None`),
    //       defaultValue,
    //       name: param.name,
    //     });
    //   }
    // }

    // if (pathParams.length > 0) {
    //   result.parameters.push(...pathParams);
    // }

    // if (requiredParams.length > 0 || optionalParams.length > 0) {
    //   result.parameters.push({ name: '*' });
    //   result.parameters.push(...requiredParams);
    //   result.parameters.push(...optionalParams);
    // }

    // result.parameters.push({
    //   annotation: py.factory.createIdentifier('float | None'),
    //   defaultValue: py.factory.createLiteral(null),
    //   name: 'timeout',
    // });
  }

  return result;
}
