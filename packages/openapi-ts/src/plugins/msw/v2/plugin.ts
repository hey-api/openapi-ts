import { getBaseUrl } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { operationToHandlerCreator } from '../shared/handlerCreator';
import { sortHandlersBySpecificity } from '../shared/sortHandlersBySpecificity';
import type { MswPlugin } from '../types';

export const handlerV2: MswPlugin['Handler'] = ({ plugin }) => {
  plugin.symbol('http', {
    external: 'msw',
  });
  const symbolHttpHandler = plugin.symbol('HttpHandler', {
    external: 'msw',
    kind: 'type',
  });
  const symbolHttpResponse = plugin.symbol('HttpResponse', {
    external: 'msw',
  });
  plugin.symbol('HttpResponseResolver', {
    external: 'msw',
    kind: 'type',
  });
  plugin.symbol('RequestHandlerOptions', {
    external: 'msw',
    kind: 'type',
  });

  // Generate resolveToNull helper
  // const resolveToNull = () => new HttpResponse(null)
  const symbolResolveToNull = plugin.symbol('resolveToNull', {
    meta: {
      category: 'function',
      resource: 'resolve-to-null',
    },
  });
  const resolveToNullFn = $.const(symbolResolveToNull).assign(
    $.func().do($.new(symbolHttpResponse, $.literal(null)).return()),
  );
  plugin.node(resolveToNullFn);

  const symbolFactory = plugin.symbol('createMswHandlers');
  const handlersObject = $.object().pretty();
  const singleHandlerFactoriesType = $.type.object();
  const handlerMeta: Array<{ isOptional: boolean; name: string; path: string }> = [];

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const handlerCreator = operationToHandlerCreator({
        examples: plugin.config.valueSources?.includes('example') ?? true,
        operation,
        plugin,
      });
      if (handlerCreator) {
        handlersObject.prop(handlerCreator.name, handlerCreator.funcNode);
        singleHandlerFactoriesType.prop(handlerCreator.name, (p) => p.type(handlerCreator.type));
        handlerMeta.push({
          isOptional: handlerCreator.isOptional,
          name: handlerCreator.name,
          path: operation.path,
        });
      }
    },
    {
      order: 'declarations',
    },
  );

  const symbolMswHandlerCreators = plugin.symbol('MswHandlerCreators');
  plugin.node($.type.alias(symbolMswHandlerCreators).export().type(singleHandlerFactoriesType));

  const symbolGetAllHandlersOptions = plugin.symbol('GetAllHandlersOptions');
  plugin.node(
    $.type
      .alias(symbolGetAllHandlersOptions)
      .export()
      .type(
        $.type
          .object()
          .prop('onMissingHandler', (p) =>
            p.optional().type($.type.or($.type.literal('error'), $.type.literal('skip'))),
          )
          .prop('overrides', (p) =>
            p.optional().type(
              $.type
                .mapped('K')
                .key($.type.operator().keyof($.type(symbolMswHandlerCreators)))
                .optional()
                .type(
                  $.type('Parameters')
                    .generic($.type(symbolMswHandlerCreators).idx($.type('K')))
                    .idx($.type.literal(0)),
                ),
            ),
          ),
      ),
  );

  const symbolMswHandlers = plugin.symbol('MswHandlers');
  plugin.node(
    $.type
      .alias(symbolMswHandlers)
      .export()
      .type(
        $.type.and(
          $.type(symbolMswHandlerCreators),
          $.type.object().prop('getAllHandlers', (p) =>
            p.type(
              $.type
                .func()
                .param('options', (pp) => pp.type(symbolGetAllHandlersOptions).optional())
                .returns($.type('Array').generic(symbolHttpHandler)),
            ),
          ),
        ),
      ),
  );

  const getAllHandlersDo: Array<ReturnType<typeof $.var | typeof $.stmt | typeof $.return>> = [];
  const hasRequiredHandlers = handlerMeta.some((h) => !h.isOptional);

  if (hasRequiredHandlers) {
    getAllHandlersDo.push(
      $.const('onMissingHandler').assign(
        $('options').attr('onMissingHandler').coalesce($.literal('skip')),
      ),
    );
  }

  getAllHandlersDo.push($.const('overrides').assign($('options').attr('overrides')));

  getAllHandlersDo.push(
    $.const('handlers')
      .type($.type('Array').generic($.type(symbolHttpHandler)))
      .assign($.array()),
  );

  // Generate addRequiredHandler helper when there are required handlers
  if (hasRequiredHandlers) {
    const errorResolver = $.func().do(
      $.new(
        symbolHttpResponse,
        $.literal('[heyapi-msw] The mock of this request is not implemented.'),
        $.object().prop('status', $.literal(501)),
      ).return(),
    );

    // handler: (value: Value | (() => HttpResponse<any>)) => HttpHandler
    const handlerParamType = $.type
      .func()
      .param('value', (pp) =>
        pp.type(
          $.type.or('Value', $.type.func().returns($.type(symbolHttpResponse).generic('any'))),
        ),
      )
      .returns($.type(symbolHttpHandler));

    getAllHandlersDo.push(
      $.const('addRequiredHandler').assign(
        $.func()
          .generic('Value')
          .param('handler', (p) => p.type(handlerParamType))
          .param('override', (p) => p.type($.type.or('Value', 'undefined')))
          .do(
            $.if($('override').looseNeq($.literal(null)))
              .do(
                $.stmt(
                  $('handlers')
                    .attr('push')
                    .call($('handler').call($('override'))),
                ),
              )
              .otherwise(
                $.if($('onMissingHandler').eq($.literal('error'))).do(
                  $.stmt($('handlers').attr('push').call($('handler').call(errorResolver))),
                ),
              ),
          ),
      ),
    );
  }

  for (const handler of sortHandlersBySpecificity(handlerMeta)) {
    if (handler.isOptional) {
      getAllHandlersDo.push(
        $.stmt(
          $('handlers')
            .attr('push')
            .call($('mocks').attr(handler.name).call($('overrides').attr(handler.name).optional())),
        ),
      );
    } else {
      getAllHandlersDo.push(
        $.stmt(
          $('addRequiredHandler').call(
            $('mocks').attr(handler.name),
            $('overrides').attr(handler.name).optional(),
          ),
        ),
      );
    }
  }

  getAllHandlersDo.push($('handlers').return());

  const baseUrl = getBaseUrl(plugin.config.baseUrl, plugin.context.ir);
  const factoryFn = $.func(symbolFactory)
    .export()
    .param('config', (p) =>
      p
        .type($.type.object().prop('baseUrl', (p) => p.optional().type('string')))
        .assign($.object()),
    )
    .returns(symbolMswHandlers)
    .do(
      $.const('baseUrl').assign(
        $('config')
          .attr('baseUrl')
          .$if(baseUrl !== undefined, (b) => b.coalesce($.literal(baseUrl!))),
      ),
      $.const('mocks').type(symbolMswHandlerCreators).assign(handlersObject),
      $.const('getAllHandlers').assign(
        $.func()
          .param('options', (p) => p.type(symbolGetAllHandlersOptions).assign($.object()))
          .returns($.type('Array').generic(symbolHttpHandler))
          .do(...getAllHandlersDo),
      ),
      $.return($.object().spread('mocks').prop('getAllHandlers', 'getAllHandlers')),
    );
  plugin.node(factoryFn);
};
