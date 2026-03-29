import { getBaseUrl } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { getHandler } from '../shared/handler';
import { getOperationComment } from '../shared/operation';
import { type HandlerInfo, sortHandlers } from '../shared/sort';
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
  plugin.symbol('HttpResponse', {
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

  const symbolRequestHandlerOptions = createRequestHandlerOptions(plugin);

  const symbolAll = plugin.symbol('all');
  const symbolFactory = plugin.symbol('createMswHandlers');
  const symbolHandler = plugin.symbol('Handler');
  const symbolInvoke = plugin.symbol('invoke');
  const symbolOne = plugin.symbol('one');
  const symbolOverrideValue = plugin.symbol('OverrideValue');
  const symbolWrap = plugin.symbol('wrap');

  const oneObject = $.object().pretty();
  const oneType = $.type.object();
  const handlerInfo: Array<HandlerInfo> = [];

  plugin.forEach(
    'operation',
    ({ operation }) => {
      const symbolHandler = getHandler({
        baseUrl,
        examples: plugin.config.valueSources?.includes('example') ?? true,
        operation,
        plugin,
      });

      const name = operation.id;
      oneType.prop(name, (p) =>
        p
          .type($(symbolHandler).typeofType())
          .$if(plugin.config.comments && getOperationComment(operation), (f, v) => f.doc(v)),
      );
      oneObject.prop(name, $(symbolWrap).call(symbolHandler));
      handlerInfo.push({ name, path: operation.path });
    },
    {
      order: 'declarations',
    },
  );

  const symbolHandlerFactoriesType = plugin.symbol('MswHandlerFactories');
  const handlerFactoriesType = $.type.alias(symbolHandlerFactoriesType).export().type(oneType);
  plugin.node(handlerFactoriesType);

  const factoryResultAll = 'all';
  const factoryResultOne = 'one';

  const symbolFactoryReturnType = plugin.symbol('CreateMswHandlersResult');
  const factoryReturnType = $.type
    .alias(symbolFactoryReturnType)
    .export()
    .type(
      $.type
        .object()
        .prop(factoryResultAll, (p) =>
          p.type(
            $.type
              .func()
              .param('options', (p) =>
                p.optional().type(
                  $.type.object().prop('one', (p) =>
                    p.optional().type(
                      $.type
                        .mapped('K')
                        .key($.type.operator().keyof($.type(symbolHandlerFactoriesType)))
                        .optional()
                        .type(
                          $.type.or(
                            $.type('Parameters')
                              .generic($.type(symbolHandlerFactoriesType).idx('K'))
                              .idx($.type.literal(0)),
                            $.type('Parameters').generic(
                              $.type(symbolHandlerFactoriesType).idx('K'),
                            ),
                          ),
                        ),
                    ),
                  ),
                ),
              )
              .returns($.type('ReadonlyArray').generic(symbolHttpHandler)),
          ),
        )
        .prop(factoryResultOne, (p) => p.type(symbolHandlerFactoriesType)),
    );
  plugin.node(factoryReturnType);

  const factoryFn = $.func(symbolFactory)
    .export()
    .param('config', (p) => p.type(symbolRequestHandlerOptions).assign($.object()))
    .returns(symbolFactoryReturnType)
    .do(
      $.type
        .alias(symbolHandler)
        .generic('R')
        .type(
          $.type
            .func()
            .param('resolver', (p) => p.optional().type('R'))
            .param('options', (p) => p.optional().type(symbolRequestHandlerOptions))
            .returns(symbolHttpHandler),
        ),
      $.func(symbolWrap)
        .generic('R')
        .param('handler', (p) => p.type($.type(symbolHandler).generic('R')))
        .returns($.type(symbolHandler).generic('R'))
        .do(
          $.return(
            $.func()
              .param('resolver')
              .param('options')
              .do(
                $.return(
                  $('handler').call('resolver', $.object().spread('config').spread('options')),
                ),
              ),
          ),
        ),
      $.const(symbolOne)
        .type($.type(symbolFactoryReturnType).idx($.type.literal(factoryResultOne)))
        .assign(oneObject),
      $.const(symbolAll)
        .type($.type(symbolFactoryReturnType).idx($.type.literal(factoryResultAll)))
        .assign(
          $.func()
            .param('options', (p) => p.assign($.object()))
            .do(
              $.type
                .alias(symbolOverrideValue)
                .generic('R')
                .type(
                  $.type.or(
                    $.type('R'),
                    $.type.tuple(
                      $.type.tupleMember('resolver').optional().type('R'),
                      $.type.tupleMember('options').optional().type(symbolRequestHandlerOptions),
                    ),
                  ),
                ),
              $.func(symbolInvoke)
                .generic('R')
                .param('fn', (p) => p.type($.type(symbolHandler).generic('R')))
                .param('override', (p) =>
                  p.optional().type($.type(symbolOverrideValue).generic('R')),
                )
                .returns(symbolHttpHandler)
                .do(
                  $.return(
                    $.ternary($('Array').attr('isArray').call('override'))
                      .do($('fn').call($.spread('override')))
                      .otherwise($('fn').call('override')),
                  ),
                ),
              $.const('overrides').assign($('options').attr('one').coalesce($.object())),
              $.array(
                ...sortHandlers(handlerInfo).map((info) =>
                  $(symbolInvoke).call(
                    $(symbolOne).attr(info.name),
                    $('overrides').attr(info.name),
                  ),
                ),
              ).return(),
            ),
        ),
      $.object().prop(factoryResultAll, symbolAll).prop(factoryResultOne, symbolOne).return(),
    );
  plugin.node(factoryFn);
};
