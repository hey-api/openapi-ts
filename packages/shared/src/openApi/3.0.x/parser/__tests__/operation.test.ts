import type { Context } from '../../../../ir/context';
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
  } as unknown as Context;

  it('should parse operation correctly', () => {
    const method = 'get';
    const operation: ParseOperationProps['operation'] = {
      operationId: 'testOperation',
      responses: {},
      security: [
        {
          apiKeyAuth: [],
        },
        {
          apiKeyAuth: [],
        },
        {
          oauthRule: ['read'],
        },
        {
          oauthRule: ['write'],
        },
      ],
      summary: 'Test Operation',
    };
    const path = '/test';

    const oauth2: SecuritySchemeObject = {
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
    };
    const securitySchemesMap = new Map<string, SecuritySchemeObject>([
      ['apiKeyAuth', { in: 'header', name: 'Auth', type: 'apiKey' }],
      ['basicAuthRule', { description: 'Basic Auth', scheme: 'basic', type: 'http' }],
      ['oauthRule', oauth2],
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
      security: [{ in: 'header', name: 'Auth', type: 'apiKey' }, oauth2],
      summary: 'Test Operation',
    });
  });
});
