import type { IrTopLevelKind } from '../../../ir/graph';
import type { IR } from '../../../ir/types';

export type BaseEvent = {
  /**
   * Path to the node, derived from the pointer.
   */
  _path: ReadonlyArray<string | number>;
  /**
   * Pointer to the node in the graph.
   */
  pointer: string;
  /**
   * Tags associated with the node.
   */
  tags?: ReadonlyArray<string>;
};

type WalkEvents = BaseEvent &
  (
    | {
        method: keyof IR.PathItemObject;
        operation: IR.OperationObject;
        path: string;
        type: Extract<IrTopLevelKind, 'operation'>;
      }
    | {
        /** Name of the parameter (e.g., "id" for a parameter defined as "#/components/parameters/id"). */
        name: string;
        parameter: IR.ParameterObject;
        type: Extract<IrTopLevelKind, 'parameter'>;
      }
    | {
        /** Name of the request body (e.g., "CreateUserRequest" for a request body defined as "#/components/requestBodies/CreateUserRequest"). */
        name: string;
        requestBody: IR.RequestBodyObject;
        type: Extract<IrTopLevelKind, 'requestBody'>;
      }
    | {
        /** Name of the schema (e.g., "User" for a schema defined as "#/components/schemas/User"). */
        name: string;
        schema: IR.SchemaObject;
        type: Extract<IrTopLevelKind, 'schema'>;
      }
    | {
        server: IR.ServerObject;
        type: Extract<IrTopLevelKind, 'server'>;
      }
    | {
        key: string;
        method: keyof IR.PathItemObject;
        operation: IR.OperationObject;
        type: Extract<IrTopLevelKind, 'webhook'>;
      }
  );

export type WalkEvent<T extends IrTopLevelKind = IrTopLevelKind> = Extract<WalkEvents, { type: T }>;
