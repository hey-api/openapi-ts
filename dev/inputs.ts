import path from 'node:path';

import { getSpecsPath } from '../packages/openapi-ts-tests/utils';

export const inputs = {
  circular: path.resolve(getSpecsPath(), '3.1.x', 'circular.yaml'),
  full: path.resolve(getSpecsPath(), '3.1.x', 'full.yaml'),
  local: 'http://localhost:8000/openapi.json',
  opencode: path.resolve(getSpecsPath(), '3.1.x', 'opencode.yaml'),
  petstore:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  redfish:
    'https://raw.githubusercontent.com/DMTF/Redfish-Publications/refs/heads/main/openapi/openapi.yaml',
  scalar: 'scalar:@scalar/access-service',
  transformers: path.resolve(getSpecsPath(), '3.1.x', 'transformers.json'),
  validators: path.resolve(getSpecsPath(), '3.1.x', 'validators.yaml'),
} as const;

export type InputKey = keyof typeof inputs;

export function getInput(key: InputKey = (process.env.INPUT as InputKey) || 'opencode') {
  const input = inputs[key];
  if (!input) {
    throw new Error(`Unknown input: ${key}. Available: ${Object.keys(inputs).join(', ')}`);
  }
  return input;
}
