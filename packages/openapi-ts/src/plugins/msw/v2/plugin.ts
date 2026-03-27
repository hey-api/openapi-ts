import { getBaseUrl } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { getHandler } from '../shared/handler';
import { sortHandlersBySpecificity } from '../shared/sortHandlersBySpecificity';
import { createRequestHandlerOptions } from '../shared/types';
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

  const baseUrl = getBaseUrl(plugin.config.baseUrl, plugin.context.ir);

  createRequestHandlerOptions(plugin);

  const symbolFactory = plugin.symbol('createMswHandlers');
  const handlersObject = $.object().pretty();
  const singleHandlerFactoriesType = $.type.object();
  const handlerMeta: Array<{ isOptional: boolean; name: string; path: string }> = [];

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const handler = getHandler({
        baseUrl,
        examples: plugin.config.valueSources?.includes('example') ?? true,
        operation,
        plugin,
      });
      plugin.node(handler.node);
      const symbolResponse = plugin.symbol('resolver');
      const symbolOptions = plugin.symbol('options');
      handlersObject.method(operation.id, (m) =>
        m
          .param(symbolResponse)
          // , (p) =>
          //   p.$if(dominantResponse.example != null && dominantResponse.statusCode != null, (pp) =>
          //     pp.assign(
          //       $.fromValue({
          //         result: dominantResponse.example,
          //         status: dominantResponse.statusCode,
          //       }),
          //     ),
          //   ),
          // )
          .param(symbolOptions)
          .do($(handler.symbol).call(symbolResponse, symbolOptions).return()),
      );
      // handlersObject.prop(operation.id, handler.symbol);
      singleHandlerFactoriesType.prop(operation.id, (p) => p.type(handler.type));
      handlerMeta.push({
        isOptional: handler.isOptional,
        name: operation.id,
        path: operation.path,
      });
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
    $.const('handlers').type($.type('Array').generic(symbolHttpHandler)).assign($.array()),
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
      .returns(symbolHttpHandler);

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

  const factoryFn = $.func(symbolFactory)
    .export()
    .param('config', (p) =>
      p
        .type($.type.object().prop('baseUrl', (p) => p.optional().type('string')))
        .assign($.object()),
    )
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
