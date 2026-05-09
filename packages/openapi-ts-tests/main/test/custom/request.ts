import type { ApiRequestOptions, ParseAs } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';
import type { OpenAPIConfig } from './OpenAPI';

/**
 *  Map parseAs → return type
 */
type ParsedResponse<T, P> =
  P extends 'blob'
    ? Blob
    : P extends 'text'
      ? string
      : P extends 'arrayBuffer'
        ? ArrayBuffer
        : P extends 'formData'
          ? FormData
          : P extends 'stream'
            ? ReadableStream
            : T;

export const request = <
  T,
  P extends ParseAs | undefined = undefined
>(
  config: OpenAPIConfig,
  options: ApiRequestOptions<T, P>,
): CancelablePromise<ParsedResponse<T, P>> =>
  new CancelablePromise((resolve, reject, onCancel) => {
    const url = `${config.BASE}${options.path}`.replace(
      '{api-version}',
      config.VERSION
    );

    try {
      //  TEMP mock request (replace with real fetch/axios later)
      const timeout = setTimeout(() => {
        resolve({
          body: {
            ...options,
          },
          ok: true,
          status: 200,
          statusText: 'dummy',
          url,
        } as any);
      }, 500);

      // ❌ cancel support
      onCancel(() => {
        clearTimeout(timeout);
      });
    } catch (error) {
      reject(error);
    }
  });