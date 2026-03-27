import { getBaseUrl } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { getHandler } from '../shared/handler';
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

  createRequestHandlerOptions(plugin);

  const symbolAll = plugin.symbol('all');
  const symbolBaseUrl = plugin.symbol('baseUrl');
  const symbolFactory = plugin.symbol('createMswHandlers');
  const symbolOne = plugin.symbol('one');
  const oneObject = $.object().pretty();
  const oneType = $.type.object();
  const handlerInfo: Array<HandlerInfo> = [];

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
      const name = operation.id;
      oneType.prop(name, (p) => p.type($(handler.symbol).typeofType()));
      oneObject.prop(
        name,
        $.func()
          .param(symbolResponse)
          .param(symbolOptions)
          .do(
            $(handler.symbol)
              .call(symbolResponse, $.object().spread(symbolOptions).prop('baseUrl', symbolBaseUrl))
              .return(),
          ),
      );
      handlerInfo.push({ name, path: operation.path });
    },
    {
      order: 'declarations',
    },
  );

  const factoryFn = $.func(symbolFactory)
    .export()
    .param('config', (p) =>
      p
        .type($.type.object().prop('baseUrl', (p) => p.optional().type('string')))
        .assign($.object()),
    )
    .do(
      $.const(symbolBaseUrl).assign(
        $('config')
          .attr('baseUrl')
          .$if(baseUrl !== undefined, (b) => b.coalesce($.literal(baseUrl!))),
      ),
      $.const(symbolOne).type(oneType).assign(oneObject),
      $.func(symbolAll)
        .param('options', (p) =>
          p
            .type(
              $.type.object().prop('overrides', (p) =>
                p.optional().type(
                  $.type
                    .mapped('K')
                    .key($.type.operator().keyof($(symbolOne).typeofType()))
                    .optional()
                    .type(
                      $.type('Parameters')
                        .generic($(symbolOne).typeofType().idx('K'))
                        .idx($.type.literal(0)),
                    ),
                ),
              ),
            )
            .assign($.object()),
        )
        .returns($.type('ReadonlyArray').generic(symbolHttpHandler))
        .do(
          $.const('overrides').assign($('options').attr('overrides').coalesce($.object())),
          $.array(
            ...sortHandlers(handlerInfo).map((info) =>
              $(symbolOne).attr(info.name).call($('overrides').attr(info.name)),
            ),
          ).return(),
        ),
      $.object().prop('all', symbolAll).prop('one', symbolOne).return(),
    );
  plugin.node(factoryFn);
};
