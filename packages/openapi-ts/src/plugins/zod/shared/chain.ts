import type { $ } from '../../../ts-dsl';

export type Chain = ReturnType<typeof $.call | typeof $.expr>;
