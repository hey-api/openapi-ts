import type { Model } from './Model';

export interface ModelComposition extends Pick<Model, '$refs' | 'enums' | 'imports' | 'properties'> {
    export: Extract<Model['export'], 'all-of' | 'any-of' | 'one-of'>;
}
