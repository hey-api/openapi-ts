import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@hey-api/spec-types';

type AnySecurityScheme =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject
  | OpenAPIV3_1.SecuritySchemeObject;

/**
 * Canonical signature for collision detection. Two security schemes with the
 * same signature would emit identical `Auth` objects on operations (ignoring
 * the optional `key` field). Returns `undefined` for unsupported schemes (no
 * conflict to track).
 *
 * The shape of the signature mirrors what the SDK plugin emits for each
 * scheme type so the parser stays in lockstep with downstream emission.
 */
export const securitySchemeSignature = (scheme: AnySecurityScheme): string | undefined => {
  switch (scheme.type) {
    case 'http': {
      const httpScheme = (scheme.scheme ?? '').toLowerCase();
      if (httpScheme !== 'bearer' && httpScheme !== 'basic') return undefined;
      return `http:${httpScheme}`;
    }
    case 'apiKey': {
      if (!scheme.in || !scheme.name) return undefined;
      if (scheme.in !== 'header' && scheme.in !== 'query' && scheme.in !== 'cookie') {
        return undefined;
      }
      return `apiKey:${scheme.in}:${scheme.name}`;
    }
    case 'oauth2':
    case 'openIdConnect':
      // both normalize to http/bearer in the sdk plugin
      return 'http:bearer';
    case 'basic':
      // Swagger 2.0
      return 'http:basic';
    default:
      return undefined;
  }
};

/**
 * Build the set of `components.securitySchemes` keys whose canonical signature
 * collides with another scheme's. Only these keys should have their name
 * preserved on the IR `key` field — schemes with unique signatures don't need
 * disambiguation at runtime.
 */
export const computeAmbiguousSecurityKeys = (
  schemes: Map<string, AnySecurityScheme>,
): Set<string> => {
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
};
