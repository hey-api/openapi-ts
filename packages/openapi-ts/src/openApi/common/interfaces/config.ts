import type { Operation, OperationParameter } from './client';

export interface Config {
  debug?: boolean;
  filterFn?: {
    operation?: (operationKey: string) => boolean;
    operationParameter?: (parameter: OperationParameter) => boolean;
  };
  nameFn: {
    operation: (operation: Omit<Operation, 'name'>) => string;
    operationParameter: (parameter: Omit<OperationParameter, 'name'>) => string;
  };
}
