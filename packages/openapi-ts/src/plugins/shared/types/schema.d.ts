import type { IR } from '../../../ir/types';

export interface SchemaWithType<
  T extends
    Required<IR.SchemaObject>['type'] = Required<IR.SchemaObject>['type'],
> extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}
