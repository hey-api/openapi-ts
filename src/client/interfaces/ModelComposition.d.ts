import type { Model } from './Model';

export interface ModelComposition {
    enums: Model[];
    export: 'one-of' | 'any-of' | 'all-of';
    imports: string[];
    properties: Model[];
}
