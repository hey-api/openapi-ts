import type { OpenApiReference as OpenApiReferenceV2 } from '../../v2/interfaces/OpenApiReference';
import type { OpenApiReference as OpenApiReferenceV3 } from '../../v3/interfaces/OpenApiReference';
import type { OpenApi } from '../interfaces/OpenApi';

const ESCAPED_REF_SLASH = /~1/g;
const ESCAPED_REF_TILDE = /~0/g;

export function getRef<T>(
  openApi: OpenApi,
  item: T & (OpenApiReferenceV2 | OpenApiReferenceV3),
): T {
  if (item.$ref) {
    // Fetch the paths to the definitions, this converts:
    // "#/components/schemas/Form" to ["components", "schemas", "Form"]
    const paths = item.$ref.replace(/^#/g, '').split('/').filter(Boolean);

    // Try to find the reference by walking down the path,
    // if we cannot find it, then we throw an error.
    let result = openApi;
    paths.forEach((path) => {
      const decodedPath = decodeURIComponent(
        path.replace(ESCAPED_REF_SLASH, '/').replace(ESCAPED_REF_TILDE, '~'),
      );
      if (result.hasOwnProperty(decodedPath)) {
        // @ts-expect-error
        result = result[decodedPath];
      } else {
        throw new Error(`Could not find reference: "${item.$ref}"`);
      }
    });
    return result as T;
  }
  return item as T;
}
