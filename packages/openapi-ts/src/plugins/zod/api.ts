import type { ZodPlugin } from './types';

export const api: ZodPlugin['api'] = {
  foo: () => 'foo',
};
