import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import {
  createOperationComment,
  hasOperationSse,
} from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { SwrPlugin } from '../types';

export const createUseSwr = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: SwrPlugin['Instance'];
  queryFn: string;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const symbolUseSwr = plugin.referenceSymbol({
    category: 'external',
    resource: 'swr',
  });
  const symbolUseQueryFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.useSwr,
      name: operation.id,
    }),
  });

  const awaitSdkFn = $(queryFn)
    .call($.object((o) => o.prop('throwOnError', $.literal(true))))
    .await();

  const statements: Array<ts.Statement | TsDsl<any>> = [];
  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  const statement = $.const(symbolUseQueryFn.placeholder)
    .export(symbolUseQueryFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.describe(v as Array<string>),
    )
    .assign(
      $.func().do(
        $.return(
          $(symbolUseSwr.placeholder).call(
            $.literal(operation.path),
            $.func()
              .async()
              .do(...statements),
          ),
        ),
      ),
    );
  plugin.setSymbolValue(symbolUseQueryFn, statement);
};
