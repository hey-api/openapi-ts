import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { getFakerPackagePath } from '../shared/helpers';
import { irOperationToAst } from '../shared/operation';
import { irOperationRequestToAst } from '../shared/operation-request';
import type { EmitTracking } from '../shared/types';
import type { FakerJsFakerPlugin } from '../types';
import { createProcessor } from './processor';

export const handlerV10: FakerJsFakerPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('faker', {
    external: getFakerPackagePath(plugin.config.locale),
    importKind: 'named',
  });

  plugin.symbol('Faker', {
    external: '@faker-js/faker',
    kind: 'type',
  });

  // Emit shared Options type
  const fakerTypeSymbol = plugin.external('@faker-js/faker.Faker');
  const optionsSymbol = plugin.symbol('Options', { kind: 'type' });
  const optionsType = $.type
    .object()
    .prop('faker', (p) => p.optional().type($.type(fakerTypeSymbol)))
    .prop('includeOptional', (p) =>
      p
        .doc([
          'Whether to include optional properties, including add property to record object.',
          'Provide a number between 0 and 1 to randomly include based on that probability.',
          '@default true',
        ])
        .optional()
        .type($.type.or($.type('boolean'), $.type('number'))),
    )
    .prop('useDefault', (p) =>
      p
        .doc([
          'Whether to use schema default values instead of generating fake data.',
          'Provide a number between 0 and 1 to randomly use defaults based on that probability.',
          '@default false',
        ])
        .optional()
        .type($.type.or($.type('boolean'), $.type('number'))),
    );
  plugin.node($.type.alias(optionsSymbol).export().type(optionsType));

  // Compute circular schema pointers from the dependency graph
  const circularPointers = new Set<string>();
  const graph = plugin.context.graph;
  if (graph) {
    for (const [pointer, deps] of graph.transitiveDependencies) {
      if (deps.has(pointer)) {
        circularPointers.add(pointer);
        continue;
      }
      for (const dep of deps) {
        if (graph.transitiveDependencies.get(dep)?.has(pointer)) {
          circularPointers.add(pointer);
          circularPointers.add(dep);
          break;
        }
      }
    }
  }

  // Reserve slots for conditional helpers — only filled if actually referenced
  const maxCallDepthSlot = plugin.node(null);
  const resolveConditionSlot = plugin.node(null);

  const tracking: EmitTracking = {
    isObjectByRef: new Map(),
    needsMaxCallDepth: false,
    needsResolveCondition: false,
    usesFakerByRef: new Map(),
  };
  const processor = createProcessor(plugin, tracking, circularPointers);

  plugin.forEach('operation', 'parameter', 'requestBody', 'schema', (event) => {
    switch (event.type) {
      case 'operation':
        irOperationRequestToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        irOperationToAst({
          operation: event.operation,
          path: event._path,
          plugin,
          processor,
          tags: event.tags,
        });
        break;
      case 'parameter':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.parameter.schema,
          tags: event.tags,
        });
        break;
      case 'requestBody':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.requestBody.schema,
          tags: event.tags,
        });
        break;
      case 'schema':
        processor.process({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(event._path),
          },
          naming: plugin.config.definitions,
          path: event._path,
          plugin,
          schema: event.schema,
          tags: event.tags,
        });
        break;
    }
  });

  // Conditionally emit MAX_CALL_DEPTH constant only when circular schemas exist
  if (tracking.needsMaxCallDepth) {
    const maxCallDepthSymbol = plugin.symbol('MAX_CALL_DEPTH');
    plugin.node(
      $.const(maxCallDepthSymbol).assign($.literal(plugin.config.maxCallDepth)),
      maxCallDepthSlot,
    );
  }

  // Conditionally emit resolveCondition helper only when referenced
  if (tracking.needsResolveCondition) {
    const conditionParamType = $.type.or($.type('boolean'), $.type('number'));
    const resolveConditionFn = $.func()
      .arrow()
      .param('condition', (p) => p.type(conditionParamType))
      .param('faker', (p) => p.type($.type(fakerTypeSymbol)))
      .returns('boolean')
      .do(
        $.return(
          $.binary(
            $('condition').eq($.literal(true)),
            '||',
            $(
              $.binary(
                $('condition').typeofExpr().eq($.literal('number')),
                '&&',
                $('faker')
                  .attr('datatype')
                  .attr('boolean')
                  .call($.object().prop('probability', $('condition'))),
              ),
            ),
          ),
        ),
      );
    const resolveConditionSymbol = plugin.symbol('resolveCondition');
    plugin.node($.const(resolveConditionSymbol).assign(resolveConditionFn), resolveConditionSlot);
  }
};
