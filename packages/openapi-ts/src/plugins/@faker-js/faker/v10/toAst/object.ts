import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Expression, FakerResult, FakerWalkerContext } from '../../shared/types';
import type { FakerJsFakerPlugin } from '../../types';

/**
 * Generates an object literal `{ prop: <walked expr>, ... }`.
 *
 * Required properties are always included. Optional properties are
 * conditionally included based on `options.includeOptional`:
 * - `true` or `undefined` (default) — always included
 * - number (0.0-1.0) — included with that probability
 * - `false` — omitted entirely
 */
export function objectToExpression({
  fakerCtx,
  schema,
  walk,
  walkerCtx,
}: {
  fakerCtx: FakerWalkerContext;
  schema: SchemaWithType<'object'>;
  walk: Walker<FakerResult, FakerJsFakerPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<FakerJsFakerPlugin['Instance']>;
}): FakerResult {
  const obj = $.object().pretty();
  const requiredSet = new Set(schema.required ?? []);
  let usesAccessor = false;
  let hasCircularRef = false;
  let hasEmittedProperty = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const result = walk(property, childContext(walkerCtx, 'properties', name));
    if (result.hasCircularRef) hasCircularRef = true;

    if (requiredSet.has(name)) {
      if (result.resultType === 'never') {
        return {
          expression: $('undefined'),
          hasCircularRef: false,
          isObjectLike: false,
          resultType: 'never',
          usesAccessor: false,
          usesFaker: false,
        };
      }
      hasEmittedProperty = true;
      obj.prop(name, result.expression);
      if (result.usesAccessor) usesAccessor = true;
    } else if (result.resultType === 'never') {
      // Optional property that can never be satisfied — skip entirely
      continue;
    } else {
      // Optional property: conditionally spread based on options.includeOptional
      hasEmittedProperty = true;
      fakerCtx.tracking.needsResolveCondition = true;
      usesAccessor = true;
      const includeCondition = $('resolveCondition').call(
        $.binary($(fakerCtx.optionsId).attr('includeOptional').optional(), '??', $.literal(true)),
        fakerCtx.fakerAccessor,
      );

      // For circular refs, add depth guard: _callDepth > MAX_CALL_DEPTH || !resolveCondition(...)
      let skipCondition: Expression;
      if (result.hasCircularRef) {
        fakerCtx.tracking.needsMaxCallDepth = true;
        const depthExceeded = $('_callDepth').gt($('MAX_CALL_DEPTH'));
        skipCondition = $.binary(depthExceeded, '||', $.prefix(includeCondition).not());
      } else {
        skipCondition = $.prefix(includeCondition).not();
      }

      const propObj = $.object().prop(name, result.expression);
      obj.spread($.ternary(skipCondition).do($.object()).otherwise(propObj));
    }
  }

  let expression: Expression = obj;

  let hasAdditionalPropertyExpression = false;

  if (!hasEmittedProperty && schema.additionalProperties) {
    const extraProperty = schema.additionalProperties;
    const result = walk(extraProperty, childContext(walkerCtx, 'additionalProperties'));

    // If we can't produce meaningful data for dictionary object, just skip it
    if (result.resultType !== 'never' && result.resultType !== 'unknown') {
      hasAdditionalPropertyExpression = true;
      if (result.hasCircularRef) hasCircularRef = true;

      // Because dictionary can be empty, so we add `includeOptional` check
      fakerCtx.tracking.needsResolveCondition = true;
      usesAccessor = true;
      const includeCondition = $('resolveCondition').call(
        $.binary($(fakerCtx.optionsId).attr('includeOptional').optional(), '??', $.literal(true)),
        fakerCtx.fakerAccessor,
      );

      let skipCondition: Expression;
      if (result.hasCircularRef) {
        fakerCtx.tracking.needsMaxCallDepth = true;
        const depthExceeded = $('_callDepth').gt($('MAX_CALL_DEPTH'));
        skipCondition = $.binary(depthExceeded, '||', $.prefix(includeCondition).not());
      } else {
        skipCondition = $.prefix(includeCondition).not();
      }

      expression = $.ternary(skipCondition)
        .do($.object().as('{}'))
        // Hardcode to additionalProp property - unless we want to extend object DSL
        .otherwise($.object().pretty().prop('additionalProp', result.expression));
    }
  }

  return {
    expression,
    hasCircularRef,
    isObjectLike: true,
    usesAccessor,
    usesFaker: hasEmittedProperty || hasAdditionalPropertyExpression,
  };
}
