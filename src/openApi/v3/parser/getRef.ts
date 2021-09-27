import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiReference } from '../interfaces/OpenApiReference';

const escapedSlash = /~1/g;
const escapedTilde = /~0/g;

export function getRef<T>(openApi: OpenApi, item: T & OpenApiReference): T {
    if (item.$ref) {
        // Fetch the paths to the definitions, this converts:
        // "#/components/schemas/Form" to ["components", "schemas", "Form"]
        const paths = item.$ref
            .replace(/^#/g, '')
            .split('/')
            .filter(item => item);

        // Try to find the reference by walking down the path,
        // if we cannot find it, then we throw an error.
        let result: any = openApi;
        paths.forEach((path: string): void => {
            path = decodeURIComponent(path.replace(escapedSlash, '/').replace(escapedTilde, '~'));
            if (result.hasOwnProperty(path)) {
                result = result[path];
            } else {
                throw new Error(`Could not find reference: "${item.$ref}"`);
            }
        });
        return result as T;
    }
    return item as T;
}
