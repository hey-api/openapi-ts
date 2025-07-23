import type ts from 'typescript';

import type { IR } from '../../../ir/types';

export interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

export type State = {
  circularReferenceTracker: Array<string>;
  hasCircularReference: boolean;
};

export type ZodSchema = {
  expression: ts.Expression;
  typeName?: string;
};
