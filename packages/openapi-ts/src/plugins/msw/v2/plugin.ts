import { parseUrl } from '@hey-api/shared';

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

  // Resolve default baseUrl from spec servers
  let defaultBaseUrl = '';
  const { servers } = plugin.context.ir;
  const firstServer = servers?.[0];
  if (firstServer) {
    const serverUrl = firstServer.url;
    const url = parseUrl(serverUrl);
    if (url.protocol && url.host && !serverUrl.includes('{')) {
      defaultBaseUrl = serverUrl;
    } else if (serverUrl !== '/' && serverUrl.startsWith('/')) {
      defaultBaseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    }
  }

  // Generate createMswHandlerFactory
  const symbolFactory = plugin.symbol('createMswHandlerFactory');
  const ofObject = $.object().pretty();
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
        ofObject.prop(handlerCreator.name, handlerCreator.value);
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

  // Emit SingleHandlerFactories type
  const symbolSingleHandlerFactories = plugin.symbol('SingleHandlerFactories');
  plugin.node($.type.alias(symbolSingleHandlerFactories).export().type(singleHandlerFactoriesType));

  // Emit GetAllMocksOptions type
  const symbolGetAllMocksOptions = plugin.symbol('GetAllMocksOptions');
  plugin.node(
    $.type
      .alias(symbolGetAllMocksOptions)
      .export()
      .type(
        $.type
          .object()
          .prop('onMissingMock', (p) =>
            p.optional().type($.type.or($.type.literal('error'), $.type.literal('skip'))),
          )
          .prop('overrides', (p) =>
            p.optional().type(
              $.type
                .mapped('K')
                .key($.type.operator().keyof($.type(symbolSingleHandlerFactories)))
                .optional()
                .type(
                  $.type.idx(
                    $.type('Parameters').generic(
                      $.type(symbolSingleHandlerFactories).idx($.type('K')),
                    ),
                    $.type.literal(0),
                  ),
                ),
            ),
          ),
      ),
  );

  // Emit MswHandlerFactory type
  const symbolMswHandlerFactory = plugin.symbol('MswHandlerFactory');
  plugin.node(
    $.type
      .alias(symbolMswHandlerFactory)
      .export()
      .type(
        $.type.and(
          $.type(symbolSingleHandlerFactories),
          $.type.object().prop('getAllMocks', (p) =>
            p.type(
              $.type
                .func()
                .param('options', (pp) => pp.type($.type(symbolGetAllMocksOptions)).optional())
                .returns($.type('Array').generic($.type(symbolHttpHandler))),
            ),
          ),
        ),
      ),
  );

  // Build getAllMocks function body
  const getAllMocksBodyStmts: Array<any> = [];
  const hasRequiredHandlers = handlerMeta.some((h) => !h.isOptional);

  if (hasRequiredHandlers) {
    getAllMocksBodyStmts.push(
      $.const('onMissingMock').assign(
        $('options').attr('onMissingMock').optional().coalesce($.literal('skip')),
      ),
    );
  }

  getAllMocksBodyStmts.push($.const('overrides').assign($('options').attr('overrides').optional()));

  getAllMocksBodyStmts.push(
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

    getAllMocksBodyStmts.push(
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
                $.if($('onMissingMock').eq($.literal('error'))).do(
                  $.stmt($('handlers').attr('push').call($('handler').call(errorResolver))),
                ),
              ),
          ),
      ),
    );
  }

  for (const handler of sortHandlersBySpecificity(handlerMeta)) {
    if (handler.isOptional) {
      getAllMocksBodyStmts.push(
        $.stmt(
          $('handlers')
            .attr('push')
            .call($('mocks').attr(handler.name).call($('overrides').attr(handler.name).optional())),
        ),
      );
    } else {
      getAllMocksBodyStmts.push(
        $.stmt(
          $('addRequiredHandler').call(
            $('mocks').attr(handler.name),
            $('overrides').attr(handler.name).optional(),
          ),
        ),
      );
    }
  }

  getAllMocksBodyStmts.push($.return($('handlers')));

  const getAllMocksFn = $.func()
    .param('options', (p) => p.optional().type($.type(symbolGetAllMocksOptions)))
    .returns($.type('Array').generic($.type(symbolHttpHandler)))
    .do(...getAllMocksBodyStmts);

  const factoryFn = $.const(symbolFactory)
    .export()
    .assign(
      $.func()
        .param('config', (p) =>
          p.optional().type($.type.object().prop('baseUrl', (p) => p.optional().type('string'))),
        )
        .returns($.type(symbolMswHandlerFactory))
        .do(
          $.const('baseUrl').assign(
            $('config').attr('baseUrl').optional().coalesce($.literal(defaultBaseUrl)),
          ),
          $.const('mocks').type('SingleHandlerFactories').assign(ofObject),
          $.const('getAllMocks').assign(getAllMocksFn),
          $.return($.object().spread('mocks').prop('getAllMocks', 'getAllMocks')),
        ),
    );
  plugin.node(factoryFn);

  // Export individual handlers with wildcard baseUrl for convenient direct imports
  const symbolDefaults = plugin.symbol('_defaults');
  plugin.node(
    $.const(symbolDefaults).assign(
      $(symbolFactory).call($.object().prop('baseUrl', $.literal('*'))),
    ),
  );
  for (const handler of handlerMeta) {
    const sym = plugin.symbol(handler.name);
    plugin.node($.const(sym).export().assign($(symbolDefaults).attr(handler.name)));
  }
  const symbolGetAllMocksExport = plugin.symbol('getAllMocks');
  plugin.node(
    $.const(symbolGetAllMocksExport).export().assign($(symbolDefaults).attr('getAllMocks')),
  );
};
