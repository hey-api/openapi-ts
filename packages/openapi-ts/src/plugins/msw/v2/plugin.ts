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
  const symbolOne = plugin.symbol('one');
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

      const symbolResponse = plugin.symbol('resolver');
      const symbolOptions = plugin.symbol('options');
      const name = operation.id;
      oneType.prop(name, (p) =>
        p
          .type($(symbolHandler).typeofType())
          .$if(plugin.config.comments && getOperationComment(operation), (f, v) => f.doc(v)),
      );
      oneObject.prop(
        name,
        $.func()
          .param(symbolResponse)
          .param(symbolOptions)
          .do(
            $(symbolHandler)
              .call(symbolResponse, $.object().spread('config').spread(symbolOptions))
              .return(),
          ),
      );
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
                  $.type.object().prop('overrides', (p) =>
                    p.optional().type(
                      $.type
                        .mapped('K')
                        .key($.type.operator().keyof($.type(symbolHandlerFactoriesType)))
                        .optional()
                        .type(
                          $.type('Parameters')
                            .generic($.type(symbolHandlerFactoriesType).idx('K'))
                            .idx($.type.literal(0)),
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
      $.const(symbolOne)
        .type($.type(symbolFactoryReturnType).idx($.type.literal(factoryResultOne)))
        .assign(oneObject),
      $.const(symbolAll)
        .type($.type(symbolFactoryReturnType).idx($.type.literal(factoryResultAll)))
        .assign(
          $.func()
            .param('options', (p) => p.assign($.object()))
            .do(
              $.const('overrides').assign($('options').attr('overrides').coalesce($.object())),
              $.array(
                ...sortHandlers(handlerInfo).map((info) =>
                  $(symbolOne).attr(info.name).call($('overrides').attr(info.name)),
                ),
              ).return(),
            ),
        ),
      $.object().prop(factoryResultAll, symbolAll).prop(factoryResultOne, symbolOne).return(),
    );
  plugin.node(factoryFn);
};
