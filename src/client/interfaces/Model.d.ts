import type { Enum } from './Enum';
import type { Schema } from './Schema';

export interface Model extends Schema {
    /**
     * **Experimental.** Contains list of original refs so they can be used
     * to access the schema from anywhere instead of relying on string name.
     * This allows us to do things like detect type of ref.
     */
    $refs: string[];
    base: string;
    default?: string;
    deprecated?: boolean;
    description: string | null;
    enum: Enum[];
    enums: Model[];
    export:
        | 'all-of'
        | 'any-of'
        | 'array'
        | 'const'
        | 'dictionary'
        | 'enum'
        | 'generic'
        | 'interface'
        | 'one-of'
        | 'reference';
    imports: string[];
    link: Model | null;
    name: string;
    properties: Model[];
    template: string | null;
    type: string;
}
