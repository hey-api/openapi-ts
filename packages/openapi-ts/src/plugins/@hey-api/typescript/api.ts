import type ts from 'typescript';

import type { IR } from '../../../ir/types';
import { schemaToType } from './plugin';

type GetIdArgs =
  | {
      type: 'ClientOptions' | 'Webhooks';
    }
  | {
      operation: IR.OperationObject;
      type:
        | 'data'
        | 'error'
        | 'errors'
        | 'response'
        | 'responses'
        | 'webhook-payload'
        | 'webhook-request';
    }
  | {
      type: 'ref';
      value: string;
    };

const getId = (args: GetIdArgs): string => {
  switch (args.type) {
    case 'data':
    case 'error':
    case 'errors':
    case 'response':
    case 'responses':
    case 'webhook-payload':
    case 'webhook-request':
      return `${args.operation.id}-${args.type}`;
    case 'ref':
      return args.value;
    default:
      return args.type;
  }
};

export type Api = {
  getId: (args: GetIdArgs) => string;
  schemaToType: (
    args: Omit<Parameters<typeof schemaToType>[0], 'onRef'> &
      Pick<Partial<Parameters<typeof schemaToType>[0]>, 'onRef'>,
  ) => ts.TypeNode;
};

export const api: Api = {
  getId,
  schemaToType: (args) =>
    schemaToType({
      onRef: undefined,
      ...args,
    }),
};
