import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { specFileToJson } from '../../../__tests__/utils';
import type { ValidatorResult } from '../../../shared/utils/validator';
import { createGraph } from '../graph';

const specsFolder = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  'openapi-ts-tests',
  'test',
  'spec',
  '3.1.x',
  'invalid',
);

describe('validate', () => {
  const scenarios: Array<
    ValidatorResult & {
      description: string;
      file: string;
    }
  > = [
    {
      description: 'servers must be array',
      file: path.join(specsFolder, 'servers-array.yaml'),
      issues: [
        {
          code: 'invalid_type',
          message: '`servers` must be an array.',
          path: [],
          severity: 'error',
        },
      ],
      valid: false,
    },
    {
      description: 'servers entry must be object',
      file: path.join(specsFolder, 'servers-entry.yaml'),
      issues: [
        {
          code: 'invalid_type',
          context: {
            actual: 'string',
            expected: 'object',
          },
          message: 'Each entry in `servers` must be an object.',
          path: ['servers', 0],
          severity: 'error',
        },
      ],
      valid: false,
    },
    {
      description: 'servers entry required fields',
      file: path.join(specsFolder, 'servers-required.yaml'),
      issues: [
        {
          code: 'missing_required_field',
          context: {
            field: 'url',
          },
          message: 'Missing required field `url` in server object.',
          path: ['servers', 0],
          severity: 'error',
        },
      ],
      valid: false,
    },
    {
      description: 'operationId must be unique',
      file: path.join(specsFolder, 'operationId-unique.yaml'),
      issues: [
        {
          code: 'duplicate_key',
          context: {
            key: 'operationId',
            value: 'foo',
          },
          message:
            'Duplicate `operationId` found. Each `operationId` must be unique.',
          path: ['paths', '/foo', 'post', 'operationId'],
          severity: 'error',
        },
      ],
      valid: false,
    },
  ];

  it.each(scenarios)('$description', ({ file, issues, valid }) => {
    const spec = specFileToJson(file);
    const result = createGraph({ spec, validate: true });
    expect(result.valid).toBe(valid);
    expect(result.issues).toEqual(issues);
  });
});
