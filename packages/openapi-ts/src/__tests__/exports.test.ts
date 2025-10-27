import { describe, expect, it } from 'vitest';

import type { IR, Operation } from '~/index';

describe('exports', () => {
  it('should export Operation type', () => {
    // This test verifies that Operation type can be imported from the main index
    // If this compiles without TypeScript errors, the type is properly exported
    type MethodNameBuilder = (
      operation: IR.OperationObject | Operation,
    ) => string;

    const builder: MethodNameBuilder = (operation) => {
      if ('operationId' in operation && operation.operationId) {
        return operation.operationId;
      }
      if ('id' in operation && operation.id) {
        return operation.id;
      }
      return operation.path ?? '';
    };

    expect(typeof builder).toBe('function');
  });

  it('should allow Operation type in methodNameBuilder signature', () => {
    // Verify that Operation type can be used in the exact same signature as the SDK plugin
    // This matches the type signature from packages/openapi-ts/src/plugins/@hey-api/sdk/types.d.ts
    type SdkMethodNameBuilder = (
      operation: IR.OperationObject | Operation,
    ) => string;

    const testBuilder: SdkMethodNameBuilder = (operation) => {
      // Test that we can access properties from both IR.OperationObject and Operation
      const id = 'id' in operation ? operation.id : undefined;
      const operationId =
        'operationId' in operation ? operation.operationId : undefined;
      const path = operation.path;

      return id || operationId || path || 'default';
    };

    expect(typeof testBuilder).toBe('function');
  });
});
