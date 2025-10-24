import type { IrTopLevelKind } from '~/ir/graph';
import type { IR } from '~/ir/types';

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
