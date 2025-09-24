import type { ICodegenFile } from '@hey-api/codegen-core';
import ts from 'typescript';

import { TypeScriptRenderer } from '../../../generate/renderer';
import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import type { HeyApiSdkPlugin } from './types';

export interface PropertyMapping {
  from: string;
  path: string;
  to: string;
}

/**
 * Prefix mapping paths with a given path prefix, if provided.
 */
const prefixMappings = (
  base: ReadonlyArray<PropertyMapping>,
  pathPrefix: string,
): Array<PropertyMapping> => {
  if (!pathPrefix) {
    return [...base];
  }

  return base.map((item) => ({
    ...item,
    path: `${pathPrefix}.${item.path}`,
  }));
};

/**
 * Remove duplicate mapping entries.
 */
const dedupeMappings = (
  mappings: ReadonlyArray<PropertyMapping>,
): Array<PropertyMapping> => {
  const seen = new Set<string>();
  const result: Array<PropertyMapping> = [];

  for (const mapping of mappings) {
    const key = `${mapping.from}::${mapping.path}::${mapping.to}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(mapping);
    }
  }

  return result;
};

/**
 * Recursively traverses a schema to collect all property mappings for wire casing preservation.
 * Handles nested objects, arrays, composition schemas (logicalOperator + items), and references.
 */
export const collectSchemaPropertyMappings = (options: {
  cache?: Map<string, Array<PropertyMapping>>;
  context: IR.Context;
  outputCase: Parameters<typeof stringCase>[0]['case'];
  pathPrefix?: string;
  schema: IR.SchemaObject;
  visited?: Set<string>;
}): Array<PropertyMapping> => {
  const {
    cache,
    context,
    outputCase,
    pathPrefix = '',
    schema,
    visited = new Set(),
  } = options;
  const mappings: Array<PropertyMapping> = [];

  // Handle $ref schemas
  if (schema.$ref) {
    // Prevent circular references - if we've already visited this ref, skip it
    if (visited.has(schema.$ref)) {
      return mappings;
    }
    visited.add(schema.$ref);

    // Serve from cache if available
    if (cache?.has(schema.$ref)) {
      const base = cache.get(schema.$ref)!;
      const resolved = prefixMappings(base, pathPrefix);
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
        cache?.set(schema.$ref, baseMappings);
        const resolved = prefixMappings(baseMappings, pathPrefix);
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
          cache?.set(schema.$ref, baseMappings);
          const resolved = prefixMappings(baseMappings, pathPrefix);
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
        cache?.set(schema.$ref, baseMappings);
        const resolved = prefixMappings(baseMappings, pathPrefix);
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
  const parts = path.split(/(\[.*?\])/);

  for (const part of parts) {
    if (!part) continue;

    if (part === '[*]') {
      segments.push({ type: 'array' });
    } else if (/^\[.+\]$/.test(part)) {
      segments.push({ type: 'additionalProps' });
    } else {
      // Split by dots and add property segments
      const properties = part.split('.').filter(Boolean);
      for (const property of properties) {
        segments.push({ name: property, type: 'property' });
      }
    }
  }

  return segments;
};

/**
 * Creates a simple property mapping statement for renaming a property.
 */
const createSimplePropertyMapping = (
  baseAccess: ts.Expression,
  from: string,
  to: string,
): ts.Statement => {
  const condition = tsc.binaryExpression({
    left: tsc.stringLiteral({ text: from }),
    operator: 'in',
    right: baseAccess,
  });

  const assignment = tsc.assignment({
    left: tsc.propertyAccessExpression({
      expression: baseAccess,
      name: to,
    }),
    right: tsc.propertyAccessExpression({
      expression: baseAccess,
      name: from,
    }),
  });

  const deletion = ts.factory.createDeleteExpression(
    tsc.propertyAccessExpression({
      expression: baseAccess,
      name: from,
    }),
  );

  return tsc.ifStatement({
    expression: condition,
    thenStatement: tsc.block({
      statements: [
        tsc.expressionToStatement({ expression: assignment }),
        tsc.expressionToStatement({ expression: deletion }),
      ],
    }),
  });
};

/**
 * Creates type guards for checking if an expression is a valid object.
 */
const createObjectGuards = (
  expression: ts.Expression,
): Array<ts.Expression> => [
  ts.factory.createBinaryExpression(
    ts.factory.createTypeOfExpression(expression),
    ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.factory.createStringLiteral('object'),
  ),
  ts.factory.createBinaryExpression(
    expression,
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.factory.createNull(),
  ),
];

/**
 * Combines multiple expressions with && operator.
 */
const combineWithAnd = (expressions: Array<ts.Expression>): ts.Expression =>
  expressions.reduce((acc, expr) =>
    ts.factory.createBinaryExpression(
      acc,
      ts.SyntaxKind.AmpersandAmpersandToken,
      expr,
    ),
  );

/**
 * Creates statements for normalizing top-level option slot names.
 * Moves capitalized variants to the lowercase keys expected by clients.
 */
const createTopLevelSlotMappings = (): Array<ts.Statement> => {
  const statements: Array<ts.Statement> = [];
  const optionsId = tsc.identifier({ text: 'options' });

  for (const { from, to } of TOP_LEVEL_SLOTS) {
    const hasFrom = ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral(from),
      ts.SyntaxKind.InKeyword,
      optionsId,
    );
    const hasTo = ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral(to),
      ts.SyntaxKind.InKeyword,
      optionsId,
    );
    const shouldAssign = ts.factory.createPrefixUnaryExpression(
      ts.SyntaxKind.ExclamationToken,
      ts.factory.createParenthesizedExpression(hasTo),
    );

    const assignLower = tsc.assignment({
      left: tsc.propertyAccessExpression({
        expression: optionsId,
        name: to,
      }),
      right: tsc.asExpression({
        expression: tsc.propertyAccessExpression({
          expression: optionsId,
          name: from,
        }),
        type: ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      }),
    });

    const deleteFrom = ts.factory.createDeleteExpression(
      tsc.propertyAccessExpression({
        expression: optionsId,
        name: from,
      }),
    );

    statements.push(
      tsc.ifStatement({
        expression: hasFrom,
        thenStatement: tsc.block({
          statements: [
            tsc.ifStatement({
              expression: shouldAssign,
              thenStatement: tsc.expressionToStatement({
                expression: assignLower,
              }),
            }),
            tsc.expressionToStatement({ expression: deleteFrom }),
          ],
        }),
      }),
    );
  }

  return statements;
};

/**
 * Collects header parameter mappings that need case conversion.
 */
const collectHeaderMappings = (
  operation: IR.OperationObject,
  outputCase: Parameters<typeof stringCase>[0]['case'],
): Array<PropertyMapping> => {
  const mappings: Array<PropertyMapping> = [];

  for (const parameterName in operation.parameters?.header) {
    const parameter = operation.parameters.header[parameterName]!;
    const wire = parameter.name;
    const generated = stringCase({ case: outputCase, value: wire });
    if (generated !== wire) {
      mappings.push({ from: generated, path: wire, to: wire });
    }
  }

  return mappings;
};

/**
 * Checks if a body type requires structured property mapping.
 */
const isStructuredBodyType = (type: string | undefined): boolean =>
  type === 'json' || type === 'form-data' || type === 'url-search-params';

/**
 * Creates parameter mapping statements for path or query parameters.
 */
const createParameterMappings = (
  parameters: Record<string, IR.ParameterObject>,
  slotName: string,
  outputCase: Parameters<typeof stringCase>[0]['case'],
  context: IR.Context,
): Array<ts.Statement> => {
  const allStatements: Array<ts.Statement> = [];
  const slotAccess = tsc.propertyAccessExpression({
    expression: tsc.identifier({ text: 'options' }),
    name: slotName,
  });

  for (const parameterName in parameters) {
    const parameter = parameters[parameterName]!;
    const wire = parameter.name;
    const generated = stringCase({ case: outputCase, value: wire });

    // Step 1: Handle parameter name mapping (if needed)
    if (generated !== wire) {
      const paramRenameCondition = tsc.binaryExpression({
        left: tsc.stringLiteral({ text: generated }),
        operator: 'in',
        right: slotAccess,
      });

      const paramRenameAssign = tsc.assignment({
        left: tsc.propertyAccessExpression({
          expression: slotAccess,
          name: wire,
        }),
        right: tsc.propertyAccessExpression({
          expression: slotAccess,
          name: generated,
        }),
      });

      const paramRenameDel = ts.factory.createDeleteExpression(
        tsc.propertyAccessExpression({
          expression: slotAccess,
          name: generated,
        }),
      );

      allStatements.push(
        tsc.ifStatement({
          expression: paramRenameCondition,
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({ expression: paramRenameAssign }),
              tsc.expressionToStatement({ expression: paramRenameDel }),
            ],
          }),
        }),
      );
    }

    // Step 2: Handle nested schema property mappings within this parameter
    if (parameter.schema) {
      const nestedMappings = collectSchemaPropertyMappings({
        context,
        outputCase,
        schema: parameter.schema,
      });

      if (nestedMappings.length) {
        const paramAccess = tsc.propertyAccessExpression({
          expression: slotAccess,
          name: wire, // Use wire name since parameter should be renamed by now
        });

        const nestedMappingStatements = generateDeepMappingStatements({
          baseAccess: paramAccess,
          mappings: nestedMappings,
        });

        if (nestedMappingStatements.length) {
          const paramExistsCondition = tsc.binaryExpression({
            left: tsc.stringLiteral({ text: wire }),
            operator: 'in',
            right: slotAccess,
          });

          allStatements.push(
            tsc.ifStatement({
              expression: paramExistsCondition,
              thenStatement: tsc.block({
                statements: nestedMappingStatements,
              }),
            }),
          );
        }
      }
    }
  }

  return allStatements;
};

/**
 * Creates an exported mapper function declaration.
 */
const createMapperFunction = (
  functionName: string,
  statements: Array<ts.Statement>,
): ts.FunctionDeclaration =>
  ts.factory.createFunctionDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    functionName,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        'options',
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      ),
    ],
    undefined,
    ts.factory.createBlock(statements, true),
  );

/**
 * Generates TypeScript statements for deep object property remapping.
 * Handles arbitrarily complex nested property paths including arrays, additionalProperties, and deep nesting.
 */
export const generateDeepMappingStatements = (options: {
  baseAccess: ts.Expression;
  mappings: Array<PropertyMapping>;
}): Array<ts.Statement> => {
  const { baseAccess, mappings } = options;
  const statements: Array<ts.Statement> = [];

  for (const { from, path, to } of mappings) {
    const segments = parsePath(path);

    if (segments.length === 0) continue;

    // Handle simple property mapping case
    if (segments.length === 1 && segments[0]!.type === 'property') {
      statements.push(createSimplePropertyMapping(baseAccess, from, to));
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
const generateComplexNestedAccess = (options: {
  baseAccess: ts.Expression;
  currentLoopVars?: Array<{ isArray: boolean; varName: string }>;
  currentSegmentIdx: number;
  from: string;
  segments: Array<PathSegment>;
  to: string;
}): ts.Statement | null => {
  const {
    baseAccess,
    currentLoopVars = [],
    currentSegmentIdx,
    from,
    segments,
    to,
  } = options;
  // Base case: we've reached the target property
  if (currentSegmentIdx >= segments.length) {
    return createSimplePropertyMapping(baseAccess, from, to);
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
      guards.push(...createObjectGuards(nextAccess));
    }

    const combinedGuard = combineWithAnd(guards);

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
    const isObject = combineWithAnd(createObjectGuards(baseAccess));

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

interface RequestKeyMapperOptions {
  operation: IR.OperationObject;
  plugin: HeyApiSdkPlugin['Instance'];
}

interface TopLevelSlot {
  from: string;
  to: string;
}

const TOP_LEVEL_SLOTS: ReadonlyArray<TopLevelSlot> = [
  { from: 'Path', to: 'path' },
  { from: 'Query', to: 'query' },
  { from: 'Headers', to: 'headers' },
  { from: 'Url', to: 'url' },
  { from: 'Body', to: 'body' },
] as const;

/**
 * Creates a shared requestKeyMapper function in a separate file and returns a reference to it.
 * This function generates the mapper function once and stores it in a shared mappers file,
 * then returns an identifier that operations can import and use.
 */
export const createRequestKeyMapper = ({
  operation,
  plugin,
}: RequestKeyMapperOptions):
  | { file: ICodegenFile; placeholder: string }
  | undefined => {
  if (!plugin.config.preserveWireCasing) return;

  const outputCase = plugin.context.config.output?.case as
    | Parameters<typeof stringCase>[0]['case']
    | undefined;

  if (!outputCase) return;

  // Create the shared mappers file
  const mappersFile = plugin.gen.createFile(`${plugin.output}RequestMappers`, {
    extension: '.ts',
    path: '{{path}}.gen',
    renderer: new TypeScriptRenderer(),
  });

  // Generate a unique function name for this operation's mapper
  const mapperFunctionName = `${operation.id}RequestKeyMapper`;

  // Check if we already generated this mapper
  const existingSymbol = mappersFile.selectSymbolFirst([
    plugin.name,
    'requestKeyMapper',
    operation.id,
  ]);
  if (existingSymbol) {
    return {
      file: mappersFile,
      placeholder: existingSymbol.placeholder,
    };
  }

  const mapperStatements: Array<ts.Statement> = [];

  // Normalize top-level option slot names in case output.case affected them.
  mapperStatements.push(...createTopLevelSlotMappings());

  // Header property mappings
  const headerMappings = collectHeaderMappings(operation, outputCase);
  if (headerMappings.length) {
    // Seed headers from capitalized `Headers` slot if present
    const hasHeadersCap = ts.factory.createBinaryExpression(
      ts.factory.createStringLiteral('Headers'),
      ts.SyntaxKind.InKeyword,
      tsc.identifier({ text: 'options' }),
    );

    const headersCapAccess = tsc.propertyAccessExpression({
      expression: tsc.identifier({ text: 'options' }),
      name: 'Headers',
    });

    const headersAccess = tsc.propertyAccessExpression({
      expression: tsc.identifier({ text: 'options' }),
      name: 'headers',
    });

    const seedStatements: Array<ts.Statement> = [];
    for (const { from } of headerMappings) {
      const capEntryAccess = ts.factory.createElementAccessExpression(
        headersCapAccess as ts.Expression,
        ts.factory.createStringLiteral(from),
      );

      const hasValue = ts.factory.createBinaryExpression(
        ts.factory.createTypeOfExpression(capEntryAccess),
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        ts.factory.createStringLiteral('undefined'),
      );

      const setRetDecl = tsc.constVariable({
        expression: ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            headersAccess as ts.Expression,
            'set',
          ),
          undefined,
          [
            ts.factory.createStringLiteral(from),
            ts.factory.createAsExpression(
              capEntryAccess,
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            ),
          ],
        ),
        name: '_seedSetRet',
      });

      const setRetCheck = ts.factory.createIfStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createTypeOfExpression(
            ts.factory.createIdentifier('_seedSetRet'),
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
                  ts.factory.createIdentifier('_seedSetRet'),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                ),
              ),
            ),
          ],
          true,
        ),
      );

      const deleteFromCap = ts.factory.createDeleteExpression(capEntryAccess);
      const deleteFromCapStmt = tsc.expressionToStatement({
        expression: deleteFromCap,
      });

      seedStatements.push(
        tsc.ifStatement({
          expression: hasValue,
          thenStatement: tsc.block({
            statements: [setRetDecl, setRetCheck, deleteFromCapStmt],
          }),
        }),
      );
    }

    if (seedStatements.length) {
      mapperStatements.push(
        tsc.ifStatement({
          expression: hasHeadersCap,
          thenStatement: tsc.block({ statements: seedStatements }),
        }),
      );
    }
    // Continue with canonical header remapping from generated → wire names
    const headersAccess2 = tsc.propertyAccessExpression({
      expression: tsc.identifier({ text: 'options' }),
      name: 'headers',
    });

    for (const { from, to } of headerMappings) {
      const slotAccess = headersAccess2;

      // const _val = headers.get(from);
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
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                ),
              ),
            ),
          ],
          true,
        ),
      );

      const deleteCheck = ts.factory.createIfStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createStringLiteral('delete'),
          ts.SyntaxKind.InKeyword,
          slotAccess as ts.Expression,
        ),
        ts.factory.createBlock(
          [
            tsc.constVariable({
              expression: ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  slotAccess as ts.Expression,
                  'delete',
                ),
                undefined,
                [ts.factory.createStringLiteral(from)],
              ),
              name: '_delRet',
            }),
            ts.factory.createIfStatement(
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
            ),
          ],
          true,
        ),
      );

      mapperStatements.push(
        valDecl,
        ts.factory.createIfStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createIdentifier('_val'),
            ts.SyntaxKind.ExclamationEqualsEqualsToken,
            ts.factory.createNull(),
          ),
          ts.factory.createBlock([setRetDecl, setRetCheck, deleteCheck], true),
        ),
      );
    }
  }

  // Path parameter property mappings
  if (operation.parameters?.path) {
    const statements = createParameterMappings(
      operation.parameters.path,
      'path',
      outputCase,
      plugin.context,
    );

    if (statements.length) {
      const pathAccess = tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        name: 'path',
      });

      mapperStatements.push(
        tsc.ifStatement({
          expression: pathAccess,
          thenStatement: tsc.block({ statements }),
        }),
      );
    }
  }

  // Query parameter property mappings
  if (operation.parameters?.query) {
    const statements = createParameterMappings(
      operation.parameters.query,
      'query',
      outputCase,
      plugin.context,
    );

    if (statements.length) {
      const queryAccess = tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        name: 'query',
      });

      mapperStatements.push(
        tsc.ifStatement({
          expression: queryAccess,
          thenStatement: tsc.block({ statements }),
        }),
      );
    }
  }

  // Body property mappings for structured bodies
  if (operation.body && isStructuredBodyType(operation.body.type)) {
    const bodyMappings = operation.body.schema
      ? collectSchemaPropertyMappings({
          context: plugin.context,
          outputCase,
          schema: operation.body.schema,
        })
      : [];

    if (bodyMappings.length) {
      const bodyAccess = tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        name: 'body',
      });

      const statements = generateDeepMappingStatements({
        baseAccess: bodyAccess,
        mappings: bodyMappings,
      });

      if (statements.length) {
        mapperStatements.push(
          tsc.ifStatement({
            expression: bodyAccess,
            thenStatement: tsc.block({ statements }),
          }),
        );
      }
    }
  }

  if (mapperStatements.length === 0) {
    return undefined;
  }

  // Create a symbol for this mapper function
  const mapperSymbol = mappersFile.addSymbol({
    name: mapperFunctionName,
    selector: [plugin.name, 'requestKeyMapper', operation.id],
  });

  // Generate the mapper function
  const mapperFunction = createMapperFunction(
    mapperSymbol.placeholder,
    mapperStatements,
  );
  mapperSymbol.update({ value: mapperFunction });

  return {
    file: mappersFile,
    placeholder: mapperSymbol.placeholder,
  };
};
