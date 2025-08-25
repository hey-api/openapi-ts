import type { IR } from '../../../ir/types';

type WalkEvents =
  | {
      method: keyof IR.PathItemObject;
      operation: IR.OperationObject;
      path: string;
      type: 'operation';
    }
  | {
      $ref: string;
      name: string;
      parameter: IR.ParameterObject;
      type: 'parameter';
    }
  | {
      $ref: string;
      name: string;
      requestBody: IR.RequestBodyObject;
      type: 'requestBody';
    }
  | {
      $ref: string;
      name: string;
      schema: IR.SchemaObject;
      type: 'schema';
    }
  | {
      server: IR.ServerObject;
      type: 'server';
    }
  | {
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
