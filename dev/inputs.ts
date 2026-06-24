import path from 'node:path';

const specsPath = path.join(import.meta.dirname, '..', 'specs');

export const inputs = {
  circular: path.resolve(specsPath, '3.0.x', 'circular.yaml'),
  clerk: path.resolve(specsPath, '3.0.x', 'clerk-2025-11-10.yaml'),
  cloudflare: path.resolve(specsPath, '3.0.x', 'cloudflare-v4.json'),
  full: path.resolve(specsPath, '3.1.x', 'full.yaml'),
  'hey-api': 'hey-api/backend',
  local: 'http://localhost:8000/openapi.json',
  mockers: path.resolve(specsPath, '3.1.x', 'mockers.yaml'),
  opencode: path.resolve(specsPath, '3.1.x', 'opencode.yaml'),
  petstore:
    'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
  raw: {
    components: {
      schemas: {
        Foo: {
          type: 'string',
        },
      },
    },
    info: {
      title: 'Raw Spec',
      version: '1.0.0',
    },
    openapi: '3.1.0',
  } as const,
  readme: 'readme:@developers/v2.0#nysezql0wwo236',
  'readme-uuid': 'readme:nysezql0wwo236',
  redfish:
    'https://raw.githubusercontent.com/DMTF/Redfish-Publications/refs/heads/main/openapi/openapi.yaml',
  rpc: path.resolve(specsPath, '3.1.x', 'rpc.yaml'),
  scalar: 'scalar:@scalar/access-service',
  transformers: path.resolve(specsPath, '3.1.x', 'transformers.json'),
  validators: path.resolve(specsPath, '3.1.x', 'validators.yaml'),
  'zoom-video-sdk': path.resolve(specsPath, '3.1.x', 'zoom-video-sdk.json'),
} as const;

export type InputKey = keyof typeof inputs;

export function getInput(key: InputKey = (process.env.INPUT as InputKey) || 'opencode') {
  const input = inputs[key] || key;
  if (!input) {
    throw new Error(`Unknown input: ${key}. Available: ${Object.keys(inputs).join(', ')}`);
  }
  return input;
}
