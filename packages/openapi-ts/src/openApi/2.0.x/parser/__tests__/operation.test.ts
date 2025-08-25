import { describe, expect, it } from 'vitest';

import type { IR } from '../../../../ir/types';
import type { SecuritySchemeObject } from '../../types/spec';
import { parsePathOperation } from '../operation';

type ParseOperationProps = Parameters<typeof parsePathOperation>[0];

describe('operation', () => {
  const context = {
    config: {
      plugins: {},
    },
    ir: {
      paths: {},
      servers: [],
    },
  } as unknown as IR.Context;

  it('should parse operation correctly', () => {
    const method = 'get';
    const operation: ParseOperationProps['operation'] = {
      operationId: 'testOperation',
      responses: {},
      security: [
        {
          apiKeyAuth: [],
          basicAuthRule: [],
        },
        {
          apiKeyAuth: [],
          oauthRule: [],
        },
      ],
      summary: 'Test Operation',
    };
    const path = '/test';
    const securitySchemesMap = new Map<string, SecuritySchemeObject>([
      ['apiKeyAuth', { in: 'header', name: 'Auth', type: 'apiKey' }],
      ['basicAuthRule', { description: 'Basic Auth', type: 'basic' }],
      [
        'oauthRule',
        {
          description: 'OAuth2',
          flow: 'password',
          scopes: {
            read: 'Grants read access',
            write: 'Grants write access',
          },
          tokenUrl: 'https://example.com/oauth/token',
          type: 'oauth2',
        },
      ],
    ]);
    const state: ParseOperationProps['state'] = {
      ids: new Map<string, string>(),
    };

    parsePathOperation({
      context,
      method,
      operation,
      path,
      securitySchemesMap,
      state,
    });

    expect(context.ir.paths?.[path]?.[method]).toEqual({
      id: 'testOperation',
      method,
      operationId: 'testOperation',
      path,
      security: [
        { in: 'header', name: 'Auth', type: 'apiKey' },
        { description: 'Basic Auth', scheme: 'basic', type: 'http' },
        {
          description: 'OAuth2',
          flows: {
            password: {
              scopes: {
                read: 'Grants read access',
                write: 'Grants write access',
              },
              tokenUrl: 'https://example.com/oauth/token',
            },
          },
          type: 'oauth2',
        },
      ],
      summary: 'Test Operation',
    });
  });
});
