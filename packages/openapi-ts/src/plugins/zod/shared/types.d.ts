import type ts from 'typescript';

import type { IR } from '../../../ir/types';

export interface SchemaWithType<T extends Required<IR.SchemaObject>['type']>
  extends Omit<IR.SchemaObject, 'type'> {
  type: Extract<Required<IR.SchemaObject>['type'], T>;
}

export type State = {
  circularReferenceTracker: Array<string>;
  /**
   * Works the same as `circularReferenceTracker`, but it resets whenever we
   * walk inside another schema. This can be used to detect if a schema
   * directly references itself.
   */
  currentReferenceTracker: Array<string>;
  hasCircularReference: boolean;
};

export type ZodSchema = {
  expression: ts.Expression;
  hasCircularReference?: boolean;
  typeName?: string | ts.Identifier;
};
