import type { IR } from '../../../ir/types';

type WalkEvents =
  | {
      _path: ReadonlyArray<string | number>;
      method: keyof IR.PathItemObject;
      operation: IR.OperationObject;
      path: string;
      type: 'operation';
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      parameter: IR.ParameterObject;
      type: 'parameter';
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      requestBody: IR.RequestBodyObject;
      type: 'requestBody';
    }
  | {
      $ref: string;
      _path: ReadonlyArray<string | number>;
      name: string;
      schema: IR.SchemaObject;
      type: 'schema';
    }
  | {
      _path: ReadonlyArray<string | number>;
      server: IR.ServerObject;
      type: 'server';
    }
  | {
      _path: ReadonlyArray<string | number>;
      key: string;
      method: keyof IR.PathItemObject;
      operation: IR.OperationObject;
      type: 'webhook';
    };

export type WalkEventType = WalkEvents['type'];
export type WalkEvent<T extends WalkEventType = WalkEventType> = Extract<
  WalkEvents,
  { type: T }
>;
