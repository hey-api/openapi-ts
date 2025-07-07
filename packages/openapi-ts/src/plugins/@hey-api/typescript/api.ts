import type { IR } from '../../../ir/types';

type GetIdArgs =
  | {
      type: 'ClientOptions';
    }
  | {
      operation: IR.OperationObject;
      type: 'data' | 'error' | 'errors' | 'response' | 'responses';
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
      return `${args.operation.id}-${args.type}`;
    case 'ref':
      return args.value;
    default:
      return args.type;
  }
};

export type Api = {
  getId: (args: GetIdArgs) => string;
};

export const api: Api = {
  getId,
};
