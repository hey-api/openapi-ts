import type { SymbolMeta } from '@hey-api/codegen-core';
import type { requestValidatorLayers } from '@hey-api/shared';

function definition(resourceId: string): SymbolMeta {
  return {
    artifact: 'zod',
    category: 'schema',
    resource: 'definition',
    resourceId,
  };
}

function operationRequest(
  resourceId: string,
  layer: (typeof requestValidatorLayers)[number],
): SymbolMeta {
  return {
    artifact: 'zod',
    category: 'schema',
    resource: 'operation',
    resourceId,
    role: `request-${layer}`,
  };
}

function operationResponses(resourceId: string): SymbolMeta {
  return {
    artifact: 'zod',
    category: 'schema',
    resource: 'operation',
    resourceId,
    role: 'responses',
  };
}

export const ZodContracts = {
  definition,
  operationRequest,
  operationResponses,
} as const;
