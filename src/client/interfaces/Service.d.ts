import type { Model } from './Model';
import type { Operation } from './Operation';

export interface Service extends Pick<Model, '$refs' | 'imports' | 'name'> {
    operations: Operation[];
}
