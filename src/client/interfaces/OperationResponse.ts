import type { Model } from './Model';

export interface OperationResponse extends Model {
    in: 'response' | 'header';
    code: number;
}
