import { describe, expect, it } from 'vitest';

import type { IR } from '../types';

describe('IR types', () => {
  it('IR.Context should be properly typed (not any)', () => {
    const mockContext = {
      config: {} as any,
      gen: {} as any,
      graph: undefined,
      ir: {},
      logger: {} as any,
      package: {} as any,
      plugins: {},
      spec: {},
    } as IR.Context;

    // If Context were 'any', TypeScript wouldn't catch type errors
    // This test verifies the type is properly resolved
    expect(mockContext.config).toBeDefined();
    expect(mockContext.spec).toBeDefined();

    // TypeScript should enforce the type structure
    // @ts-expect-error - nonExistentProperty should not exist on Context
    expect(mockContext.nonExistentProperty).toBeUndefined();
  });

  it('IR.ReferenceObject should be properly typed (not any)', () => {
    const mockRef: IR.ReferenceObject = {
      $ref: '#/components/schemas/Pet',
    };

    // Verify $ref property exists and has correct type
    expect(mockRef.$ref).toBe('#/components/schemas/Pet');

    // TypeScript should enforce the type structure
    // @ts-expect-error - nonExistentProperty should not exist on ReferenceObject
    expect(mockRef.nonExistentProperty).toBeUndefined();
  });

  it('IR.Context should support generic parameter', () => {
    type CustomSpec = { title: string; version: string };
    const mockContext = {
      config: {} as any,
      gen: {} as any,
      graph: undefined,
      ir: {},
      logger: {} as any,
      package: {} as any,
      plugins: {},
      spec: { title: 'API', version: '1.0' },
    } as IR.Context<CustomSpec>;

    // Verify the generic parameter is properly typed
    const spec: CustomSpec = mockContext.spec;
    expect(spec.title).toBe('API');
    expect(spec.version).toBe('1.0');
  });
});
