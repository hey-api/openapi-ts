import type {
  Client as ParserClient,
  Method,
  Model,
  ModelMeta,
  Operation as ParserOperation,
  OperationParameter,
  OperationResponse,
} from '../openApi';

export type { Method, Model, ModelMeta, OperationParameter, OperationResponse };

export interface Operation extends Omit<ParserOperation, 'tags'> {
  service: string;
}

export interface Service extends Pick<Model, '$refs' | 'imports' | 'name'> {
  operations: Operation[];
}

export interface Client extends Omit<ParserClient, 'operations'> {
  services: Service[];
}
