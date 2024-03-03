import type { Operation } from './Operation';

export interface Service {
    imports: string[];
    name: string;
    operations: Operation[];
}
