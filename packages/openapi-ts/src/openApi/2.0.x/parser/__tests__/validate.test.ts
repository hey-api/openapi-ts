import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getSpecsPath, specFileToJson } from '~/openApi/__tests__/utils';
import type { ValidatorResult } from '~/openApi/shared/utils/validator';

import { Logger } from '../../../../utils/logger';
import { validateOpenApiSpec } from '../validate';

const specsFolder = path.join(getSpecsPath(), '2.0.x', 'invalid');

describe('validate', () => {
  const scenarios: Array<
    ValidatorResult & {
      description: string;
      file: string;
    }
  > = [
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
    const logger = new Logger();
    const result = validateOpenApiSpec(spec, logger);
    expect(result.valid).toBe(valid);
    expect(result.issues).toEqual(issues);
  });
});
