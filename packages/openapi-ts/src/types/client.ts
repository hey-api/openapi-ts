import type {
  Client as ParserClient,
  Method,
  Model,
  Operation as ParserOperation,
  OperationParameter,
} from '../openApi';

export type { Method, Model, OperationParameter };

export interface Operation extends Omit<ParserOperation, 'tags'> {
  service: string;
}

export interface Service extends Pick<Model, '$refs' | 'imports' | 'name'> {
  operations: Operation[];
}

export interface Client extends Omit<ParserClient, 'operations'> {
  services: Service[];
}
