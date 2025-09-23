import type { ICodegenFile, ICodegenSymbolOut } from '@hey-api/codegen-core';
import ts from 'typescript';

import { clientModulePath } from '../../../generate/client';
import { statusCodeToGroup } from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { sanitizeNamespaceIdentifier } from '../../../openApi';
import { ensureValidIdentifier } from '../../../openApi/shared/utils/identifier';
import { tsc } from '../../../tsc';
import type { FunctionParameter, ObjectValue } from '../../../tsc/types';
import { reservedJavaScriptKeywordsRegExp } from '../../../utils/regexp';
import { stringCase } from '../../../utils/stringCase';
import { transformClassName } from '../../../utils/transform';
import type { Field, Fields } from '../client-core/bundle/params';
import { getClientPlugin } from '../client-core/utils';
import type { PluginState } from '../typescript/types';
import { operationAuth } from './auth';
import { nuxtTypeComposable, nuxtTypeDefault } from './constants';
import type { HeyApiSdkPlugin } from './types';
import { createRequestValidator, createResponseValidator } from './validator';

interface ClassNameEntry {
  /**
   * Name of the class where this function appears.
   */
  className: string;
  /**
   * Name of the function within the class.
   */
  methodName: string;
  /**
   * JSONPath-like array to class location.
   */
  path: ReadonlyArray<string>;
}

const operationClassName = ({
  context,
  value,
}: {
  context: IR.Context;
  value: string;
}) => {
  const name = stringCase({
    case: 'PascalCase',
    value: sanitizeNamespaceIdentifier(value),
  });
  return transformClassName({
    config: context.config,
    name,
  });
};

const getOperationMethodName = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: {
    config: Pick<
      HeyApiSdkPlugin['Instance']['config'],
      'asClass' | 'methodNameBuilder'
    >;
  };
}) => {
  if (plugin.config.methodNameBuilder) {
    return plugin.config.methodNameBuilder(operation);
  }

  const handleIllegal = !plugin.config.asClass;
  if (handleIllegal && operation.id.match(reservedJavaScriptKeywordsRegExp)) {
    return `${operation.id}_`;
  }

  return operation.id;
};

/**
 * Returns a list of classes where this operation appears in the generated SDK.
 */
export const operationClasses = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: {
    config: Pick<
      HeyApiSdkPlugin['Instance']['config'],
      'asClass' | 'classStructure' | 'instance'
    >;
  };
}): Map<string, ClassNameEntry> => {
  const classNames = new Map<string, ClassNameEntry>();

  let className: string | undefined;
  let methodName: string | undefined;
  let classCandidates: Array<string> = [];

  if (plugin.config.classStructure === 'auto' && operation.operationId) {
    classCandidates = operation.operationId.split(/[./]/).filter(Boolean);
    if (classCandidates.length > 1) {
      const methodCandidate = classCandidates.pop()!;
      methodName = stringCase({
        case: 'camelCase',
        value: sanitizeNamespaceIdentifier(methodCandidate),
      });
      className = classCandidates.pop()!;
    }
  }

  const rootClasses = plugin.config.instance
    ? [plugin.config.instance as string]
    : (operation.tags ?? ['default']);

  for (const rootClass of rootClasses) {
    const finalClassName = operationClassName({
      context,
      value: className || rootClass,
    });

    // Default path
    let path = [rootClass];
    if (className) {
      // If root class is already within classCandidates or the same as className
      // do not add it again as this will cause a recursion issue.
      if (classCandidates.includes(rootClass) || rootClass === className) {
        path = [...classCandidates, className];
      } else {
        path = [rootClass, ...classCandidates, className];
      }
    }

    classNames.set(rootClass, {
      className: finalClassName,
      methodName: methodName || getOperationMethodName({ operation, plugin }),
      path: path.map((value) =>
        operationClassName({
          context,
          value,
        }),
      ),
    });
  }

  return classNames;
};

export const operationOptionsType = ({
  file,
  operation,
  plugin,
  throwOnError,
}: {
  file: ICodegenFile;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
  throwOnError?: string;
}) => {
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolDataType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector('data', operation.id),
  );
  if (symbolDataType) {
    file.addImport({
      from: symbolDataType.file,
      typeNames: [symbolDataType.placeholder],
    });
  }
  const dataType = symbolDataType?.placeholder || 'unknown';

  const symbolOptions = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('Options'),
  );

  if (isNuxtClient) {
    const symbolResponseType = plugin.gen.selectSymbolFirst(
      pluginTypeScript.api.getSelector('response', operation.id),
    );
    if (symbolResponseType) {
      file.addImport({
        from: symbolResponseType.file,
        typeNames: [symbolResponseType.placeholder],
      });
    }
    const responseType = symbolResponseType?.placeholder || 'unknown';
    return `${symbolOptions.placeholder}<${nuxtTypeComposable}, ${dataType}, ${responseType}, ${nuxtTypeDefault}>`;
  }

  // TODO: refactor this to be more generic, works for now
  if (throwOnError) {
    return `${symbolOptions.placeholder}<${dataType}, ${throwOnError}>`;
  }
  return symbolDataType
    ? `${symbolOptions.placeholder}<${symbolDataType.placeholder}>`
    : symbolOptions.placeholder;
};

type OperationParameters = {
  argNames: Array<string>;
  fields: Array<Field | Fields>;
  parameters: Array<FunctionParameter>;
};

export const operationParameters = ({
  file,
  isRequiredOptions,
  operation,
  plugin,
}: {
  file: ICodegenFile;
  isRequiredOptions: boolean;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): OperationParameters => {
  const result: OperationParameters = {
    argNames: [],
    fields: [],
    parameters: [],
  };

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  const typescriptState: PluginState = {
    usedTypeIDs: new Set<string>(),
  };
  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  if (plugin.config.params_EXPERIMENTAL === 'experiment') {
    if (operation.parameters?.path) {
      for (const key in operation.parameters.path) {
        const parameter = operation.parameters.path[key]!;
        const name = ensureValidIdentifier(parameter.name);
        // TODO: detect duplicates
        result.argNames.push(name);
        result.fields.push({
          in: 'path',
          key: name,
        });
        result.parameters.push({
          isRequired: parameter.required,
          name,
          type: pluginTypeScript.api.schemaToType({
            onRef: (symbol) => {
              file.addImport({
                from: symbol.file,
                typeNames: [symbol.placeholder],
              });
            },
            plugin: pluginTypeScript,
            schema: parameter.schema,
            state: typescriptState,
          }),
        });
      }
    }

    if (operation.parameters?.query) {
      for (const key in operation.parameters.query) {
        const parameter = operation.parameters.query[key]!;
        const name = ensureValidIdentifier(parameter.name);
        // TODO: detect duplicates
        result.argNames.push(name);
        result.fields.push({
          in: 'path',
          key: name,
        });
        result.parameters.push({
          isRequired: parameter.required,
          name,
          type: pluginTypeScript.api.schemaToType({
            onRef: (symbol) => {
              file.addImport({
                from: symbol.file,
                typeNames: [symbol.placeholder],
              });
            },
            plugin: pluginTypeScript,
            schema: parameter.schema,
            state: typescriptState,
          }),
        });
      }
    }

    if (operation.body) {
      const name = 'body';
      // TODO: detect duplicates
      result.argNames.push(name);
      result.fields.push({ in: 'body' });
      result.parameters.push({
        isRequired: operation.body.required,
        name,
        type: pluginTypeScript.api.schemaToType({
          onRef: (symbol) => {
            file.addImport({
              from: symbol.file,
              typeNames: [symbol.placeholder],
            });
          },
          plugin: pluginTypeScript,
          schema: operation.body.schema,
          state: typescriptState,
        }),
      });
    }
  }

  result.parameters.push({
    isRequired: isRequiredOptions,
    name: 'options',
    // TODO: ensure no path, body, query
    type: operationOptionsType({
      file,
      operation,
      plugin,
      throwOnError: isNuxtClient ? undefined : 'ThrowOnError',
    }),
  });

  return result;
};

/**
 * Infers `responseType` value from provided response content type. This is
 * an adapted version of `getParseAs()` from the Fetch API client.
 *
 * From Axios documentation:
 * `responseType` indicates the type of data that the server will respond with
 * options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
 * browser only: 'blob'
 */
const getResponseType = (
  contentType: string | null | undefined,
):
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'stream'
  | 'text'
  | undefined => {
  if (!contentType) {
    return;
  }

  const cleanContent = contentType.split(';')[0]?.trim();

  if (!cleanContent) {
    return;
  }

  if (
    cleanContent.startsWith('application/json') ||
    cleanContent.endsWith('+json')
  ) {
    return 'json';
  }

  // Axios does not handle form data out of the box
  // if (cleanContent === 'multipart/form-data') {
  //   return 'formData';
  // }

  if (
    ['application/', 'audio/', 'image/', 'video/'].some((type) =>
      cleanContent.startsWith(type),
    )
  ) {
    return 'blob';
  }

  if (cleanContent.startsWith('text/')) {
    return 'text';
  }

  return;
};

type PropertyMapping = { from: string; path: string; to: string };

/**
 * Prefix mapping paths with a given path prefix, if provided.
 */
const prefixMappings = ({
  base,
  pathPrefix,
}: {
  base: ReadonlyArray<PropertyMapping>;
  pathPrefix: string;
}): Array<PropertyMapping> => {
  if (!pathPrefix) return [...base];
  const prefixed: Array<PropertyMapping> = [];
  for (const item of base) {
    prefixed.push({
      from: item.from,
      path: `${pathPrefix}.${item.path}`,
      to: item.to,
    });
  }
  return prefixed;
};

/**
 * Remove duplicate mapping entries.
 */
const dedupeMappings = (
  input: ReadonlyArray<PropertyMapping>,
): Array<PropertyMapping> => {
  const set = new Set<string>();
  const out: Array<PropertyMapping> = [];
  for (const m of input) {
    const key = `${m.from}::${m.path}::${m.to}`;
    if (!set.has(key)) {
      set.add(key);
      out.push(m);
    }
  }
  return out;
};

/**
 * Recursively traverses a schema to collect all property mappings for wire casing preservation.
 * Handles nested objects, arrays, composition schemas (logicalOperator + items), and references.
 */
const collectSchemaPropertyMappings = ({
  cache,
  context,
  outputCase,
  pathPrefix = '',
  schema,
  visited = new Set(),
}: {
  cache?: Map<string, Array<PropertyMapping>>;
  context: IR.Context;
  outputCase: Parameters<typeof stringCase>[0]['case'];
  pathPrefix?: string;
  schema: IR.SchemaObject;
  visited?: Set<string>;
}): Array<PropertyMapping> => {
  const mappings: Array<PropertyMapping> = [];

  // Handle $ref schemas
  if (schema.$ref) {
    // Prevent circular references - if we've already visited this ref, skip it
    if (visited.has(schema.$ref)) {
      return mappings;
    }
    visited.add(schema.$ref);

    // Serve from cache if available
    if (cache && cache.has(schema.$ref)) {
      const base = cache.get(schema.$ref)!;
      const resolved = prefixMappings({ base, pathPrefix });
      mappings.push(...resolved);
      visited.delete(schema.$ref);
      return mappings;
    }

    // First try resolving against IR. IR refs can point to either a schema
    // directly or an object that contains a `schema` (e.g., requestBodies).
    try {
      const irResolved = context.resolveIrRef<unknown>(
        schema.$ref,
      ) as unknown as Record<string, unknown>;

      const candidateSchema: IR.SchemaObject | undefined =
        (irResolved && 'schema' in irResolved
          ? (irResolved.schema as IR.SchemaObject)
          : (irResolved as unknown as IR.SchemaObject)) || undefined;

      if (candidateSchema) {
        // Collect base mappings without a prefix for cache correctness
        const baseMappings = collectSchemaPropertyMappings({
          cache,
          context,
          outputCase,
          pathPrefix: '',
          schema: candidateSchema,
          visited,
        });
        if (cache) cache.set(schema.$ref, baseMappings);
        const resolved = prefixMappings({ base: baseMappings, pathPrefix });
        mappings.push(...resolved);
        visited.delete(schema.$ref);
        return mappings;
      }
    } catch {
      // ignore and try spec resolution
    }

    // Fallback to resolving against the original spec (for non-IR pointers)
    try {
      const specResolved = context.resolveRef<unknown>(
        schema.$ref,
      ) as unknown as Record<string, unknown>;

      // If the ref points to a RequestBodyObject in the spec
      if (specResolved && 'content' in specResolved) {
        const content = specResolved.content as
          | Record<string, { schema?: unknown }>
          | undefined;
        let jsonSchema: unknown | undefined;

        if (content) {
          // Prefer application/json, otherwise pick the first entry
          jsonSchema = content['application/json']?.schema;
          if (!jsonSchema) {
            const first = Object.values(content)[0];
            jsonSchema = first?.schema;
          }
        }

        if (jsonSchema) {
          const baseMappings = collectSchemaPropertyMappings({
            cache,
            context,
            outputCase,
            pathPrefix: '',
            // Cast is safe for traversal as we only access JSON Schema-like fields
            schema: jsonSchema as unknown as IR.SchemaObject,
            visited,
          });
          if (cache) cache.set(schema.$ref, baseMappings);
          const resolved = prefixMappings({ base: baseMappings, pathPrefix });
          mappings.push(...resolved);
          visited.delete(schema.$ref);
          return mappings;
        }
      }

      // If the ref points directly to a SchemaObject in the spec
      if (
        specResolved &&
        ('type' in specResolved || 'properties' in specResolved)
      ) {
        const baseMappings = collectSchemaPropertyMappings({
          cache,
          context,
          outputCase,
          pathPrefix: '',
          schema: specResolved as unknown as IR.SchemaObject,
          visited,
        });
        if (cache) cache.set(schema.$ref, baseMappings);
        const resolved = prefixMappings({ base: baseMappings, pathPrefix });
        mappings.push(...resolved);
        visited.delete(schema.$ref);
        return mappings;
      }
    } catch {
      // If both resolution methods fail, skip this $ref
    }

    visited.delete(schema.$ref);
    return mappings;
  }

  // Handle object properties
  if (schema.type === 'object' && schema.properties) {
    for (const propertyName in schema.properties) {
      const property = schema.properties[propertyName]!;
      const wire = propertyName;
      const generated = stringCase({ case: outputCase, value: wire });
      const currentPath = pathPrefix
        ? `${pathPrefix}.${propertyName}`
        : propertyName;

      // Add mapping if property name changes
      if (generated !== wire) {
        mappings.push({ from: generated, path: currentPath, to: wire });
      }

      // Recursively handle nested schemas
      const nestedMappings = collectSchemaPropertyMappings({
        cache,
        context,
        outputCase,
        pathPrefix: currentPath,
        schema: property,
        visited,
      });
      mappings.push(...nestedMappings);
    }
  }

  // Handle additionalProperties
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === 'object'
  ) {
    const additionalMappings = collectSchemaPropertyMappings({
      cache,
      context,
      outputCase,
      pathPrefix: pathPrefix ? `${pathPrefix}[*]` : `[*]`,
      schema: schema.additionalProperties,
      visited,
    });
    mappings.push(...additionalMappings);
  }

  // Handle patternProperties
  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const patternSchema = schema.patternProperties[pattern]!;
      const patternMappings = collectSchemaPropertyMappings({
        cache,
        context,
        outputCase,
        pathPrefix: pathPrefix ? `${pathPrefix}.[${pattern}]` : `[${pattern}]`,
        schema: patternSchema,
        visited,
      });
      mappings.push(...patternMappings);
    }
  }

  // Handle array items
  if (schema.type === 'array' && schema.items) {
    // Handle both single item schema and array of schemas
    const itemSchemas = Array.isArray(schema.items)
      ? schema.items
      : [schema.items];

    for (let i = 0; i < itemSchemas.length; i++) {
      const itemSchema = itemSchemas[i]!;
      const itemMappings = collectSchemaPropertyMappings({
        cache,
        context,
        outputCase,
        pathPrefix: pathPrefix ? `${pathPrefix}[*]` : `[*]`,
        schema: itemSchema,
        visited,
      });
      mappings.push(...itemMappings);
    }
  }

  // Handle composition schemas via items array
  // In the IR, composition schemas (allOf, oneOf, anyOf) are flattened into the items array
  if (schema.items && schema.logicalOperator) {
    for (let i = 0; i < schema.items.length; i++) {
      const compositionSchema = schema.items[i]!;
      const compositionMappings = collectSchemaPropertyMappings({
        cache,
        context,
        outputCase,
        pathPrefix,
        schema: compositionSchema,
        visited,
      });
      mappings.push(...compositionMappings);
    }
  }

  return dedupeMappings(mappings);
};

/**
 * Represents a parsed path segment for complex nested property access.
 */
type PathSegment =
  | { name: string; type: 'property' }
  | { type: 'array' }
  | { type: 'additionalProps' };

/**
 * Parses a complex path like "parent[*].child.grandchild[*].prop" into segments.
 */
const parsePath = (path: string): Array<PathSegment> => {
  const segments: Array<PathSegment> = [];
  const parts = path.split(/(\[.*?\])/); // Split by brackets, keeping them

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part === '[*]') {
      segments.push({ type: 'array' });
    } else if (part.match(/^\[.+\]$/)) {
      segments.push({ type: 'additionalProps' });
    } else if (part) {
      // Split by dots and add property segments
      const props = part.split('.').filter((p) => p);
      for (const prop of props) {
        segments.push({ name: prop, type: 'property' });
      }
    }
  }

  return segments;
};

/**
 * Generates TypeScript statements for deep object property remapping.
 * Handles arbitrarily complex nested property paths including arrays, additionalProperties, and deep nesting.
 */
const generateDeepMappingStatements = ({
  baseAccess,
  mappings,
}: {
  baseAccess: ts.Expression;
  mappings: Array<PropertyMapping>;
}): Array<ts.Statement> => {
  const statements: Array<ts.Statement> = [];

  for (const { from, path, to } of mappings) {
    const segments = parsePath(path);

    if (segments.length === 0) continue;

    // If it's just one property segment, handle as simple case
    if (segments.length === 1 && segments[0]!.type === 'property') {
      const simpleCondition = tsc.binaryExpression({
        left: tsc.stringLiteral({ text: from }),
        operator: 'in',
        right: baseAccess,
      });

      const simpleAssign = tsc.assignment({
        left: tsc.propertyAccessExpression({
          expression: baseAccess,
          name: to,
        }),
        right: tsc.propertyAccessExpression({
          expression: baseAccess,
          name: from,
        }),
      });

      const simpleDel = ts.factory.createDeleteExpression(
        tsc.propertyAccessExpression({
          expression: baseAccess,
          name: from,
        }),
      );

      statements.push(
        tsc.ifStatement({
          expression: simpleCondition,
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({ expression: simpleAssign }),
              tsc.expressionToStatement({ expression: simpleDel }),
            ],
          }),
        }),
      );
      continue;
    }

    // Generate complex nested access
    const result = generateComplexNestedAccess({
      baseAccess,
      currentSegmentIdx: 0,
      from,
      segments,
      to,
    });

    if (result) {
      statements.push(result);
    }
  }

  return statements;
};

/**
 * Recursively generates nested access statements for complex paths.
 */
const generateComplexNestedAccess = ({
  baseAccess,
  currentLoopVars = [],
  currentSegmentIdx,
  from,
  segments,
  to,
}: {
  baseAccess: ts.Expression;
  currentLoopVars?: Array<{ isArray: boolean; varName: string }>;
  currentSegmentIdx: number;
  from: string;
  segments: Array<PathSegment>;
  to: string;
}): ts.Statement | null => {
  if (currentSegmentIdx >= segments.length) {
    // We've reached the end - this is where the final property mapping happens
    const finalCondition = tsc.binaryExpression({
      left: tsc.stringLiteral({ text: from }),
      operator: 'in',
      right: baseAccess,
    });

    const assign = tsc.assignment({
      left: tsc.propertyAccessExpression({
        expression: baseAccess,
        name: to,
      }),
      right: tsc.propertyAccessExpression({
        expression: baseAccess,
        name: from,
      }),
    });

    const del = ts.factory.createDeleteExpression(
      tsc.propertyAccessExpression({
        expression: baseAccess,
        name: from,
      }),
    );

    return tsc.ifStatement({
      expression: finalCondition,
      thenStatement: tsc.block({
        statements: [
          tsc.expressionToStatement({ expression: assign }),
          tsc.expressionToStatement({ expression: del }),
        ],
      }),
    });
  }

  const segment = segments[currentSegmentIdx]!;

  if (segment.type === 'property') {
    // Property access - check existence and recurse deeper
    const propExists = tsc.binaryExpression({
      left: tsc.stringLiteral({ text: segment.name }),
      operator: 'in',
      right: baseAccess,
    });

    const nextAccess = tsc.propertyAccessExpression({
      expression: baseAccess,
      name: segment.name,
    });

    // Add object check if there are more segments after this property
    const hasMoreSegments = currentSegmentIdx < segments.length - 1;
    const guards: Array<ts.Expression> = [propExists];

    if (hasMoreSegments) {
      guards.push(
        ts.factory.createBinaryExpression(
          ts.factory.createBinaryExpression(
            ts.factory.createTypeOfExpression(nextAccess),
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.factory.createStringLiteral('object'),
          ),
          ts.SyntaxKind.AmpersandAmpersandToken,
          ts.factory.createBinaryExpression(
            nextAccess,
            ts.SyntaxKind.ExclamationEqualsEqualsToken,
            ts.factory.createNull(),
          ),
        ),
      );
    }

    const combinedGuard = guards.reduce((acc, guard) =>
      ts.factory.createBinaryExpression(
        acc,
        ts.SyntaxKind.AmpersandAmpersandToken,
        guard,
      ),
    );

    const innerStatement = generateComplexNestedAccess({
      baseAccess: nextAccess,
      currentLoopVars,
      currentSegmentIdx: currentSegmentIdx + 1,
      from,
      segments,
      to,
    });

    if (!innerStatement) return null;

    return tsc.ifStatement({
      expression: combinedGuard,
      thenStatement: innerStatement,
    });
  } else if (segment.type === 'array') {
    // Array iteration - create for-of loop
    const arrayExists = tsc.binaryExpression({
      left: tsc.stringLiteral({ text: 'length' }),
      operator: 'in',
      right: baseAccess,
    });

    const isArray = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Array'),
        'isArray',
      ),
      undefined,
      [baseAccess],
    );

    const loopVar = tsc.identifier({ text: `item${currentLoopVars.length}` });

    const innerStatement = generateComplexNestedAccess({
      baseAccess: loopVar,
      currentLoopVars: [
        ...currentLoopVars,
        { isArray: true, varName: loopVar.text! },
      ],
      currentSegmentIdx: currentSegmentIdx + 1,
      from,
      segments,
      to,
    });

    if (!innerStatement) return null;

    const loop = ts.factory.createForOfStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(loopVar as ts.Identifier)],
        ts.NodeFlags.Const,
      ),
      baseAccess,
      ts.factory.createBlock([innerStatement], true),
    );

    return tsc.ifStatement({
      expression: ts.factory.createBinaryExpression(
        arrayExists,
        ts.SyntaxKind.AmpersandAmpersandToken,
        isArray,
      ),
      thenStatement: loop,
    });
  } else if (segment.type === 'additionalProps') {
    // Object.keys iteration for additionalProperties
    const isObject = ts.factory.createBinaryExpression(
      ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(baseAccess),
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.factory.createStringLiteral('object'),
      ),
      ts.SyntaxKind.AmpersandAmpersandToken,
      ts.factory.createBinaryExpression(
        baseAccess,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createNull(),
      ),
    );

    const keysCall = ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Object'),
        'keys',
      ),
      undefined,
      [baseAccess],
    );

    const keyVar = tsc.identifier({ text: `key${currentLoopVars.length}` });
    const valueAccess = ts.factory.createElementAccessExpression(
      baseAccess,
      keyVar as ts.Expression,
    );

    const innerStatement = generateComplexNestedAccess({
      baseAccess: valueAccess,
      currentLoopVars: [
        ...currentLoopVars,
        { isArray: false, varName: keyVar.text! },
      ],
      currentSegmentIdx: currentSegmentIdx + 1,
      from,
      segments,
      to,
    });

    if (!innerStatement) return null;

    const loop = ts.factory.createForOfStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(keyVar as ts.Identifier)],
        ts.NodeFlags.Const,
      ),
      keysCall,
      ts.factory.createBlock([innerStatement], true),
    );

    return tsc.ifStatement({
      expression: isObject,
      thenStatement: loop,
    });
  }

  return null;
};

export const operationStatements = ({
  isRequiredOptions,
  opParameters,
  operation,
  plugin,
}: {
  isRequiredOptions: boolean;
  opParameters: OperationParameters;
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}): Array<ts.Statement> => {
  const f = plugin.gen.ensureFile(plugin.output);

  const client = getClientPlugin(plugin.context.config);
  const isNuxtClient = client.name === '@hey-api/client-nuxt';

  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');

  const symbolResponseType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector(
      isNuxtClient ? 'response' : 'responses',
      operation.id,
    ),
  );
  if (symbolResponseType) {
    f.addImport({
      from: symbolResponseType.file,
      typeNames: [symbolResponseType.placeholder],
    });
  }
  const responseType = symbolResponseType?.placeholder || 'unknown';

  const symbolErrorType = plugin.gen.selectSymbolFirst(
    pluginTypeScript.api.getSelector(
      isNuxtClient ? 'error' : 'errors',
      operation.id,
    ),
  );
  if (symbolErrorType) {
    f.addImport({
      from: symbolErrorType.file,
      typeNames: [symbolErrorType.placeholder],
    });
  }
  const errorType = symbolErrorType?.placeholder || 'unknown';

  // TODO: transform parameters
  // const query = {
  //   BarBaz: options.query.bar_baz,
  //   qux_quux: options.query.qux_quux,
  //   fooBar: options.query.foo_bar,
  // };

  // if (operation.parameters) {
  //   for (const name in operation.parameters.query) {
  //     const parameter = operation.parameters.query[name]
  //     if (parameter.name !== fieldName({ context, name: parameter.name })) {
  //       console.warn(parameter.name)
  //     }
  //   }
  // }

  const requestOptions: Array<ObjectValue> = [];

  if (operation.body) {
    switch (operation.body.type) {
      case 'form-data': {
        const symbol = f.ensureSymbol({
          name: 'formDataBodySerializer',
          selector: plugin.api.getSelector('formDataBodySerializer'),
        });
        f.addImport({
          from: clientModulePath({
            config: plugin.context.config,
            sourceOutput: f.path,
          }),
          names: [symbol.name],
        });
        requestOptions.push({ spread: symbol.placeholder });
        break;
      }
      case 'json':
        // jsonBodySerializer is the default, no need to specify
        break;
      case 'text':
      case 'octet-stream':
        // ensure we don't use any serializer by default
        requestOptions.push({
          key: 'bodySerializer',
          value: null,
        });
        break;
      case 'url-search-params': {
        const symbol = f.ensureSymbol({
          name: 'urlSearchParamsBodySerializer',
          selector: plugin.api.getSelector('urlSearchParamsBodySerializer'),
        });
        f.addImport({
          from: clientModulePath({
            config: plugin.context.config,
            sourceOutput: f.path,
          }),
          names: [symbol.name],
        });
        requestOptions.push({ spread: symbol.placeholder });
        break;
      }
    }
  }

  // Generate request key mapper for path/query/headers when preserving wire casing
  const outputCase = plugin.context.config.output?.case as
    | Parameters<typeof stringCase>[0]['case']
    | undefined;
  const shouldPreserveWireCasing = Boolean(plugin.config.preserveWireCasing);

  if (shouldPreserveWireCasing && outputCase) {
    const group: Record<
      'path' | 'query' | 'headers' | 'cookie',
      Array<{ from: string; to: string }>
    > = {
      cookie: [],
      headers: [],
      path: [],
      query: [],
    };

    for (const name in operation.parameters?.path) {
      const param = operation.parameters.path[name]!;
      const wire = param.name;
      const generated = stringCase({ case: outputCase, value: wire });
      if (generated !== wire) {
        group.path.push({ from: generated, to: wire });
      }
    }

    for (const name in operation.parameters?.query) {
      const param = operation.parameters.query[name]!;
      const wire = param.name;
      const generated = stringCase({ case: outputCase, value: wire });
      if (generated !== wire) {
        group.query.push({ from: generated, to: wire });
      }
    }

    for (const name in operation.parameters?.header) {
      const param = operation.parameters.header[name]!;
      const wire = param.name;
      const generated = stringCase({ case: outputCase, value: wire });
      if (generated !== wire) {
        group.headers.push({ from: generated, to: wire });
      }
    }

    for (const name in operation.parameters?.cookie) {
      const param = operation.parameters.cookie[name]!;
      const wire = param.name;
      const generated = stringCase({ case: outputCase, value: wire });
      if (generated !== wire) {
        group.cookie.push({ from: generated, to: wire });
      }
    }

    // Also check parameter schemas for object properties (OpenAPI 3.1 feature)
    // Parameters can have object schemas with properties that need remapping
    const parameterSchemaMappings: Array<{
      mappings: Array<{ from: string; path: string; to: string }>;
      paramName: string;
      slot: 'path' | 'query' | 'headers' | 'cookie';
    }> = [];

    const checkParameterSchemas = (
      slot: 'path' | 'query' | 'headers' | 'cookie',
    ) => {
      const slotKey = slot === 'headers' ? 'header' : slot;
      const parameters = operation.parameters?.[slotKey];
      if (!parameters) return;

      for (const name in parameters) {
        const param = parameters[name]!;
        // Check if parameter schema is an object with properties
        if (param.schema) {
          const schemaMappings = collectSchemaPropertyMappings({
            context: plugin.context,
            outputCase,
            schema: param.schema,
          });

          if (schemaMappings.length > 0) {
            parameterSchemaMappings.push({
              mappings: schemaMappings,
              paramName: param.name,
              slot,
            });
          }
        }
      }
    };

    checkParameterSchemas('path');
    checkParameterSchemas('query');
    checkParameterSchemas('headers');
    checkParameterSchemas('cookie');

    const mapperStatements: Array<ts.Statement> = [];

    const addSlotMappings = (slot: 'path' | 'query' | 'headers' | 'cookie') => {
      const mappings = group[slot];
      if (!mappings.length) return;

      const slotAccess = tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        name: slot,
      });

      const inner: Array<ts.Statement> = [];
      for (const { from, to } of mappings) {
        if (slot === 'headers') {
          // Block to avoid const name collisions for multiple mappings
          const blockStatements: Array<ts.Statement> = [];

          // if ('get' in headers && 'set' in headers) { ... } else { object path }
          const hasGet = ts.factory.createBinaryExpression(
            ts.factory.createStringLiteral('get'),
            ts.SyntaxKind.InKeyword,
            slotAccess,
          );
          const hasSet = ts.factory.createBinaryExpression(
            ts.factory.createStringLiteral('set'),
            ts.SyntaxKind.InKeyword,
            slotAccess,
          );
          const hasGetAndSet = ts.factory.createBinaryExpression(
            hasGet,
            ts.SyntaxKind.AmpersandAmpersandToken,
            hasSet,
          );

          // const _val = headers.get(from)
          const valDecl = tsc.constVariable({
            expression: ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                slotAccess as ts.Expression,
                'get',
              ),
              undefined,
              [ts.factory.createStringLiteral(from)],
            ),
            name: '_val',
          });

          // if (_val !== null) { const _setRet = headers.set(to, _val as any); if (typeof _setRet !== 'undefined') options.headers = _setRet as any; if ('delete' in headers) { const _delRet = headers.delete(from); if (typeof _delRet !== 'undefined') options.headers = _delRet as any; } }
          const setRetDecl = tsc.constVariable({
            expression: ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                slotAccess as ts.Expression,
                'set',
              ),
              undefined,
              [
                ts.factory.createStringLiteral(to),
                ts.factory.createAsExpression(
                  ts.factory.createIdentifier('_val'),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                ),
              ],
            ),
            name: '_setRet',
          });
          const setRetCheck = ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              ts.factory.createTypeOfExpression(
                ts.factory.createIdentifier('_setRet'),
              ),
              ts.SyntaxKind.ExclamationEqualsEqualsToken,
              ts.factory.createStringLiteral('undefined'),
            ),
            ts.factory.createBlock(
              [
                ts.factory.createExpressionStatement(
                  ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('options'),
                      'headers',
                    ),
                    ts.SyntaxKind.EqualsToken,
                    ts.factory.createAsExpression(
                      ts.factory.createIdentifier('_setRet'),
                      ts.factory.createKeywordTypeNode(
                        ts.SyntaxKind.AnyKeyword,
                      ),
                    ),
                  ),
                ),
              ],
              true,
            ),
          );

          const hasDelete = ts.factory.createBinaryExpression(
            ts.factory.createStringLiteral('delete'),
            ts.SyntaxKind.InKeyword,
            slotAccess,
          );
          const delRetDecl = tsc.constVariable({
            expression: ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                slotAccess as ts.Expression,
                'delete',
              ),
              undefined,
              [ts.factory.createStringLiteral(from)],
            ),
            name: '_delRet',
          });
          const delRetCheck = ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              ts.factory.createTypeOfExpression(
                ts.factory.createIdentifier('_delRet'),
              ),
              ts.SyntaxKind.ExclamationEqualsEqualsToken,
              ts.factory.createStringLiteral('undefined'),
            ),
            ts.factory.createBlock(
              [
                ts.factory.createExpressionStatement(
                  ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('options'),
                      'headers',
                    ),
                    ts.SyntaxKind.EqualsToken,
                    ts.factory.createAsExpression(
                      ts.factory.createIdentifier('_delRet'),
                      ts.factory.createKeywordTypeNode(
                        ts.SyntaxKind.AnyKeyword,
                      ),
                    ),
                  ),
                ),
              ],
              true,
            ),
          );

          const headerMethodThen = ts.factory.createBlock(
            [
              valDecl,
              ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                  ts.factory.createIdentifier('_val'),
                  ts.SyntaxKind.ExclamationEqualsEqualsToken,
                  ts.factory.createNull(),
                ),
                ts.factory.createBlock(
                  [
                    setRetDecl,
                    setRetCheck,
                    ts.factory.createIfStatement(
                      hasDelete,
                      ts.factory.createBlock([delRetDecl, delRetCheck], true),
                      undefined,
                    ),
                  ],
                  true,
                ),
                undefined,
              ),
            ],
            true,
          );

          const objectCond = tsc.binaryExpression({
            left: tsc.stringLiteral({ text: from }),
            operator: 'in',
            right: slotAccess,
          });
          const objectAssign = tsc.assignment({
            left: tsc.propertyAccessExpression({
              expression: slotAccess,
              name: to,
            }),
            right: tsc.propertyAccessExpression({
              expression: slotAccess,
              name: from,
            }),
          });
          const objectDel = ts.factory.createDeleteExpression(
            tsc.propertyAccessExpression({
              expression: slotAccess,
              name: from,
            }),
          );
          const objectThen = tsc.block({
            statements: [
              tsc.expressionToStatement({ expression: objectAssign }),
              tsc.expressionToStatement({ expression: objectDel }),
            ],
          });

          blockStatements.push(
            ts.factory.createIfStatement(
              hasGetAndSet,
              headerMethodThen,
              ts.factory.createIfStatement(
                objectCond as ts.Expression,
                objectThen as ts.Statement,
                undefined,
              ),
            ),
          );

          inner.push(ts.factory.createBlock(blockStatements, true));
        } else {
          const condition = tsc.binaryExpression({
            left: tsc.stringLiteral({ text: from }),
            operator: 'in',
            right: slotAccess,
          });

          const assign = tsc.assignment({
            left: tsc.propertyAccessExpression({
              expression: slotAccess,
              name: to,
            }),
            right: tsc.propertyAccessExpression({
              expression: slotAccess,
              name: from,
            }),
          });
          const del = ts.factory.createDeleteExpression(
            tsc.propertyAccessExpression({
              expression: slotAccess,
              name: from,
            }),
          );

          const thenBlock = tsc.block({
            statements: [
              tsc.expressionToStatement({ expression: assign }),
              tsc.expressionToStatement({ expression: del }),
            ],
          });

          inner.push(
            tsc.ifStatement({
              expression: condition,
              thenStatement: thenBlock,
            }),
          );
        }
      }

      mapperStatements.push(
        tsc.ifStatement({
          expression: slotAccess,
          thenStatement: tsc.block({ statements: inner }),
        }),
      );
    };

    addSlotMappings('path');
    addSlotMappings('query');
    addSlotMappings('headers');
    addSlotMappings('cookie');

    // Handle parameter schema object property mappings (OpenAPI 3.1 feature)
    for (const { mappings, paramName, slot } of parameterSchemaMappings) {
      if (mappings.length === 0) continue;

      const slotAccess = tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        name: slot,
      });

      // Access the specific parameter object within the slot
      // e.g., options.query[paramName] for query parameters
      const paramAccess = tsc.propertyAccessExpression({
        expression: slotAccess,
        name: paramName,
      });

      // Generate mapping statements for the parameter's object properties
      const paramMappingStatements = generateDeepMappingStatements({
        baseAccess: paramAccess,
        mappings,
      });

      if (paramMappingStatements.length > 0) {
        // Add condition to check if the parameter exists and is an object
        const paramExistsCondition = tsc.binaryExpression({
          left: tsc.stringLiteral({ text: paramName }),
          operator: 'in',
          right: slotAccess,
        });

        const paramIsObjectCondition = ts.factory.createBinaryExpression(
          ts.factory.createBinaryExpression(
            ts.factory.createTypeOfExpression(paramAccess as ts.Expression),
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.factory.createStringLiteral('object'),
          ),
          ts.SyntaxKind.AmpersandAmpersandToken,
          ts.factory.createBinaryExpression(
            paramAccess as ts.Expression,
            ts.SyntaxKind.ExclamationEqualsEqualsToken,
            ts.factory.createNull(),
          ),
        );

        const combinedCondition = ts.factory.createBinaryExpression(
          paramExistsCondition as ts.Expression,
          ts.SyntaxKind.AmpersandAmpersandToken,
          paramIsObjectCondition,
        );

        mapperStatements.push(
          tsc.ifStatement({
            expression: slotAccess,
            thenStatement: tsc.ifStatement({
              expression: combinedCondition,
              thenStatement: tsc.block({ statements: paramMappingStatements }),
            }),
          }),
        );
      }
    }

    // Body property mappings for structured bodies (json, form-data, url-search-params)
    // Now supports nested objects, arrays, composition schemas, and references
    if (
      operation.body &&
      (operation.body.type === 'json' ||
        operation.body.type === 'form-data' ||
        operation.body.type === 'url-search-params')
    ) {
      const schema = operation.body.schema;
      if (schema) {
        // Use the new recursive schema property mapping function
        const bodyMappings = collectSchemaPropertyMappings({
          context: plugin.context,
          outputCase,
          schema,
        });

        if (bodyMappings.length) {
          const bodyAccess = tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            name: 'body',
          });

          // Generate mapping statements using the new deep mapping function
          const inner = generateDeepMappingStatements({
            baseAccess: bodyAccess,
            mappings: bodyMappings,
          });

          if (inner.length) {
            mapperStatements.push(
              tsc.ifStatement({
                expression: bodyAccess,
                thenStatement: tsc.block({ statements: inner }),
              }),
            );
          }
        }
      }
    }

    if (mapperStatements.length) {
      requestOptions.push({
        key: 'requestKeyMapper',
        value: tsc.arrowFunction({
          parameters: [
            {
              name: 'options',
            },
          ],
          statements: mapperStatements,
        }),
      });
    }
  }

  // TODO: parser - set parseAs to skip inference if every response has the same
  // content type. currently impossible because successes do not contain
  // header information

  for (const name in operation.parameters?.query) {
    const parameter = operation.parameters.query[name]!;
    if (
      (parameter.schema.type === 'array' ||
        parameter.schema.type === 'tuple') &&
      (parameter.style !== 'form' || !parameter.explode)
    ) {
      // override the default settings for `querySerializer`
      requestOptions.push({
        key: 'querySerializer',
        value: [
          {
            key: 'array',
            value: [
              {
                key: 'explode',
                value: false,
              },
              {
                key: 'style',
                value: 'form',
              },
            ],
          },
        ],
      });
      break;
    }
  }

  const requestValidator = createRequestValidator({ operation, plugin });
  if (requestValidator) {
    requestOptions.push({
      key: 'requestValidator',
      value: requestValidator,
    });
  }

  if (plugin.config.transformer === '@hey-api/transformers') {
    const pluginTransformers = plugin.getPluginOrThrow(
      plugin.config.transformer,
    );
    const symbolResponseTransformer = plugin.gen.selectSymbolFirst(
      pluginTransformers.api.getSelector('response', operation.id),
    );
    if (symbolResponseTransformer?.value) {
      f.addImport({
        from: symbolResponseTransformer.file,
        names: [symbolResponseTransformer.placeholder],
      });
      requestOptions.push({
        key: 'responseTransformer',
        value: symbolResponseTransformer.placeholder,
      });
    }
  }

  let hasServerSentEvents = false;
  let responseTypeValue: ReturnType<typeof getResponseType> | undefined;

  for (const statusCode in operation.responses) {
    const response = operation.responses[statusCode]!;

    // try to infer `responseType` option for Axios. We don't need this in
    // Fetch API client because it automatically detects the correct response
    // during runtime.
    if (!responseTypeValue && client.name === '@hey-api/client-axios') {
      // this doesn't handle default status code for now
      if (statusCodeToGroup({ statusCode }) === '2XX') {
        responseTypeValue = getResponseType(response.mediaType);
        if (responseTypeValue) {
          requestOptions.push({
            key: 'responseType',
            value: responseTypeValue,
          });
        }
      }
    }

    if (response.mediaType === 'text/event-stream') {
      hasServerSentEvents = true;
    }
  }

  const responseValidator = createResponseValidator({ operation, plugin });
  if (responseValidator) {
    requestOptions.push({
      key: 'responseValidator',
      value: responseValidator,
    });
  }

  if (plugin.config.responseStyle === 'data') {
    requestOptions.push({
      key: 'responseStyle',
      value: plugin.config.responseStyle,
    });
  }

  const auth = operationAuth({ context: plugin.context, operation, plugin });
  if (auth.length) {
    requestOptions.push({
      key: 'security',
      value: tsc.arrayLiteralExpression({ elements: auth }),
    });
  }

  requestOptions.push({
    key: 'url',
    value: operation.path,
  });

  // options must go last to allow overriding parameters above
  requestOptions.push({ spread: 'options' });

  const statements: Array<ts.Statement> = [];
  const hasParams = opParameters.argNames.length;

  if (hasParams) {
    const args: Array<unknown> = [];
    const config: Array<unknown> = [];
    for (const argName of opParameters.argNames) {
      args.push(tsc.identifier({ text: argName }));
    }
    for (const field of opParameters.fields) {
      const obj: Array<Record<string, unknown>> = [];
      if ('in' in field) {
        obj.push({
          key: 'in',
          value: field.in,
        });
        if (field.key) {
          obj.push({
            key: 'key',
            value: field.key,
          });
        }
        if (field.map) {
          obj.push({
            key: 'map',
            value: field.map,
          });
        }
      }
      config.push(tsc.objectExpression({ obj }));
    }
    const symbol = f.ensureSymbol({
      name: 'buildClientParams',
      selector: plugin.api.getSelector('buildClientParams'),
    });
    f.addImport({
      aliases: {
        buildClientParams: symbol.placeholder,
      },
      from: clientModulePath({
        config: plugin.context.config,
        sourceOutput: f.path,
      }),
      names: ['buildClientParams'],
    });
    statements.push(
      tsc.constVariable({
        expression: tsc.callExpression({
          functionName: symbol.placeholder,
          parameters: [
            tsc.arrayLiteralExpression({ elements: args }),
            tsc.arrayLiteralExpression({ elements: config }),
          ],
        }),
        name: 'params',
      }),
    );
    requestOptions.push({ spread: 'params' });
  }

  if (operation.body) {
    const parameterContentType = operation.parameters?.header?.['content-type'];
    const hasRequiredContentType = Boolean(parameterContentType?.required);
    // spreading required Content-Type on generated header would throw a TypeScript error
    if (!hasRequiredContentType) {
      const headersValue: Array<unknown> = [
        {
          key: parameterContentType?.name ?? 'Content-Type',
          // form-data does not need Content-Type header, browser will set it automatically
          value:
            operation.body.type === 'form-data'
              ? null
              : operation.body.mediaType,
        },
        {
          spread: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            isOptional: !isRequiredOptions,
            name: 'headers',
          }),
        },
      ];
      if (hasParams) {
        headersValue.push({
          spread: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'params' }),
            name: 'headers',
          }),
        });
      }
      requestOptions.push({
        key: 'headers',
        value: headersValue,
      });
    }
  }

  let symbolClient: ICodegenSymbolOut | undefined;
  if (plugin.config.client && client.api && 'getSelector' in client.api) {
    symbolClient = plugin.gen.selectSymbolFirst(
      // @ts-expect-error
      client.api.getSelector('client'),
    );
    if (symbolClient) {
      f.addImport({
        from: symbolClient.file,
        names: [symbolClient.placeholder],
      });
    }
  }

  const optionsClient = tsc.propertyAccessExpression({
    expression: tsc.identifier({ text: 'options' }),
    isOptional: !isRequiredOptions,
    name: 'client',
  });

  let clientExpression: ts.Expression;
  if (plugin.config.instance) {
    clientExpression = tsc.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: tsc.propertyAccessExpression({
        expression: tsc.this(),
        name: '_client',
      }),
    });
  } else if (symbolClient) {
    clientExpression = tsc.binaryExpression({
      left: optionsClient,
      operator: '??',
      right: symbolClient.placeholder,
    });
  } else {
    clientExpression = optionsClient;
  }

  const types: Array<string | ts.StringLiteral> = [];
  if (isNuxtClient) {
    types.push(
      nuxtTypeComposable,
      `${responseType} | ${nuxtTypeDefault}`,
      errorType,
      nuxtTypeDefault,
    );
  } else {
    types.push(responseType, errorType, 'ThrowOnError');
  }

  if (plugin.config.responseStyle === 'data') {
    types.push(tsc.stringLiteral({ text: plugin.config.responseStyle }));
  }

  let functionName = hasServerSentEvents
    ? tsc.propertyAccessExpression({
        expression: clientExpression,
        name: tsc.identifier({ text: 'sse' }),
      })
    : clientExpression;

  functionName = tsc.propertyAccessExpression({
    expression: functionName,
    name: tsc.identifier({ text: operation.method }),
  });

  statements.push(
    tsc.returnFunctionCall({
      args: [
        tsc.objectExpression({
          identifiers: ['responseTransformer'],
          obj: requestOptions,
        }),
      ],
      name: functionName,
      types,
    }),
  );

  return statements;
};
