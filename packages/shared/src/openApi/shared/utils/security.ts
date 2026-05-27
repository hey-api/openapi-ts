import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@hey-api/spec-types';

type AnySecurityScheme =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject
  | OpenAPIV3_1.SecuritySchemeObject;

export function securitySchemeSignature(scheme: AnySecurityScheme): string | undefined {
  switch (scheme.type) {
    case 'apiKey': {
      if (!scheme.in || !scheme.name) return;
      if (scheme.in !== 'header' && scheme.in !== 'query' && scheme.in !== 'cookie') {
        return;
      }
      return `apiKey:${scheme.in}:${scheme.name}`;
    }
    case 'basic':
      return 'http:basic';
    case 'http': {
      const httpScheme = (scheme.scheme ?? '').toLowerCase();
      if (httpScheme !== 'bearer' && httpScheme !== 'basic') return;
      return `http:${httpScheme}`;
    }
    case 'oauth2':
    case 'openIdConnect':
      // both normalize to http/bearer in the sdk plugin
      return 'http:bearer';
    default:
      return;
  }
}

/**
 * Build the set of security keys whose canonical signature collides
 * with another scheme. Only these keys should have their name preserved
 * on the IR `key` field — schemes with unique signatures don't need
 * disambiguation at runtime.
 */
export function computeAmbiguousSecurityKeys(schemes: Map<string, AnySecurityScheme>): Set<string> {
  const buckets = new Map<string, Array<string>>();
  for (const [name, scheme] of schemes) {
    const signature = securitySchemeSignature(scheme);
    if (!signature) continue;
    const bucket = buckets.get(signature) ?? [];
    bucket.push(name);
    buckets.set(signature, bucket);
  }
  const ambiguous = new Set<string>();
  for (const bucket of buckets.values()) {
    if (bucket.length < 2) continue;
    for (const name of bucket) ambiguous.add(name);
  }
  return ambiguous;
}
