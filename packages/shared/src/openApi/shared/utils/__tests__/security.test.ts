import type { OpenAPIV3_1 } from '@hey-api/spec-types';

import { computeAmbiguousSecurityKeys, securitySchemeSignature } from '../security';

describe('securitySchemeSignature', () => {
  it('returns the same signature for two http/bearer schemes', () => {
    const bearerAuth: OpenAPIV3_1.SecuritySchemeObject = {
      scheme: 'bearer',
      type: 'http',
    };
    const refreshAuth: OpenAPIV3_1.SecuritySchemeObject = {
      scheme: 'bearer',
      type: 'http',
    };
    expect(securitySchemeSignature(bearerAuth)).toBe(securitySchemeSignature(refreshAuth));
  });

  it('returns different signatures for http/bearer vs http/basic', () => {
    const bearerAuth: OpenAPIV3_1.SecuritySchemeObject = {
      scheme: 'bearer',
      type: 'http',
    };
    const basicAuth: OpenAPIV3_1.SecuritySchemeObject = {
      scheme: 'basic',
      type: 'http',
    };
    expect(securitySchemeSignature(bearerAuth)).not.toBe(securitySchemeSignature(basicAuth));
  });

  it('returns the same signature for matching apiKey location + name', () => {
    const a: OpenAPIV3_1.SecuritySchemeObject = {
      in: 'header',
      name: 'X-Token',
      type: 'apiKey',
    };
    const b: OpenAPIV3_1.SecuritySchemeObject = {
      in: 'header',
      name: 'X-Token',
      type: 'apiKey',
    };
    expect(securitySchemeSignature(a)).toBe(securitySchemeSignature(b));
  });

  it('returns different signatures for apiKey with different headers', () => {
    const a: OpenAPIV3_1.SecuritySchemeObject = {
      in: 'header',
      name: 'X-Token',
      type: 'apiKey',
    };
    const b: OpenAPIV3_1.SecuritySchemeObject = {
      in: 'header',
      name: 'X-Other',
      type: 'apiKey',
    };
    expect(securitySchemeSignature(a)).not.toBe(securitySchemeSignature(b));
  });

  it('treats oauth2 and openIdConnect as bearer-equivalent', () => {
    const oauth: OpenAPIV3_1.SecuritySchemeObject = {
      flows: {
        password: {
          scopes: { read: 'read' },
          tokenUrl: 'https://example.com/token',
        },
      },
      type: 'oauth2',
    };
    const oidc: OpenAPIV3_1.SecuritySchemeObject = {
      openIdConnectUrl: 'https://example.com/.well-known/openid-configuration',
      type: 'openIdConnect',
    };
    const bearer: OpenAPIV3_1.SecuritySchemeObject = {
      scheme: 'bearer',
      type: 'http',
    };
    expect(securitySchemeSignature(oauth)).toBe(securitySchemeSignature(bearer));
    expect(securitySchemeSignature(oidc)).toBe(securitySchemeSignature(bearer));
  });
});

describe('computeAmbiguousSecurityKeys', () => {
  it('returns an empty set when every scheme has a unique signature', () => {
    const schemes = new Map<string, OpenAPIV3_1.SecuritySchemeObject>([
      ['bearerAuth', { scheme: 'bearer', type: 'http' }],
      ['basicAuth', { scheme: 'basic', type: 'http' }],
      ['headerKey', { in: 'header', name: 'X-Key', type: 'apiKey' }],
    ]);
    expect(computeAmbiguousSecurityKeys(schemes).size).toBe(0);
  });

  it('flags every scheme in a colliding bucket', () => {
    const schemes = new Map<string, OpenAPIV3_1.SecuritySchemeObject>([
      ['bearerAuth', { scheme: 'bearer', type: 'http' }],
      ['refreshAuth', { scheme: 'bearer', type: 'http' }],
      ['exchangeAuth', { scheme: 'bearer', type: 'http' }],
      ['basicAuth', { scheme: 'basic', type: 'http' }],
    ]);
    const ambiguous = computeAmbiguousSecurityKeys(schemes);
    expect(ambiguous).toEqual(new Set(['bearerAuth', 'refreshAuth', 'exchangeAuth']));
  });

  it('ignores unsupported schemes', () => {
    const schemes = new Map<string, OpenAPIV3_1.SecuritySchemeObject>([
      // mutualTLS has no Auth signature
      ['mtls', { type: 'mutualTLS' }],
      // bearer is unique → not flagged
      ['bearerAuth', { scheme: 'bearer', type: 'http' }],
    ]);
    expect(computeAmbiguousSecurityKeys(schemes).size).toBe(0);
  });
});
