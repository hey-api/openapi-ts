import type { IR } from '../../../ir/types';

export type SchemaWithType<
  T extends
    Required<IR.SchemaObject>['type'] = Required<IR.SchemaObject>['type'],
> = Omit<IR.SchemaObject, 'type'> & {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
};
