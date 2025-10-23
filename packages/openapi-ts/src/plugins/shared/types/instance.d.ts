import type { IrTopLevelKind } from '../../../ir/graph';
import type { IR } from '../../../ir/types';

type WalkEvents =
  | {
      _path: ReadonlyArray<string | number>;
      method: keyof IR.PathItemObject;
      operation: IR.OperationObject;
      path: string;
      type: Extract<IrTopLevelKind, 'operation'>;
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      parameter: IR.ParameterObject;
      type: Extract<IrTopLevelKind, 'parameter'>;
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      requestBody: IR.RequestBodyObject;
      type: Extract<IrTopLevelKind, 'requestBody'>;
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      schema: IR.SchemaObject;
      type: Extract<IrTopLevelKind, 'schema'>;
    }
  | {
      _path: ReadonlyArray<string | number>;
      server: IR.ServerObject;
      type: Extract<IrTopLevelKind, 'server'>;
    }
  | {
      _path: ReadonlyArray<string | number>;
      key: string;
      method: keyof IR.PathItemObject;
      operation: IR.OperationObject;
      type: Extract<IrTopLevelKind, 'webhook'>;
    };

export type WalkEvent<T extends IrTopLevelKind = IrTopLevelKind> = Extract<
  WalkEvents,
  { type: T }
>;

export type WalkOptions = {
  /**
   * Order of walking schemas.
   *
   * The "declarations" option ensures that schemas are walked in the order
   * they are declared in the input document. This is useful for scenarios where
   * the order of declaration matters, such as when generating code that relies
   * on the sequence of schema definitions.
   *
   * The "topological" option ensures that schemas are walked in an order
   * where dependencies are visited before the schemas that depend on them.
   * This is useful for scenarios where you need to process or generate
   * schemas in a way that respects their interdependencies.
   *
   * @default 'topological'
   */
  order?: 'declarations' | 'topological';
};
