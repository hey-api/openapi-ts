import {
  $RefParser,
  getResolvedInput,
  type JSONSchema,
  sendRequest,
} from '@hey-api/json-schema-ref-parser';

import { mergeHeaders } from './plugins/@hey-api/client-fetch/bundle';
import type { Config } from './types/config';
import type { WatchValues } from './types/types';

interface SpecResponse {
  data: JSONSchema;
  error?: undefined;
  response?: undefined;
}

interface SpecError {
  data?: undefined;
  error: 'not-modified' | 'not-ok';
  response: Response;
}

/**
 * @internal
 */
export const getSpec = async ({
  fetchOptions,
  inputPath,
  timeout,
  watch,
}: {
  fetchOptions?: RequestInit;
  inputPath: Config['input']['path'];
  timeout: number;
  watch: WatchValues;
}): Promise<SpecResponse | SpecError> => {
  const refParser = new $RefParser();
  const resolvedInput = getResolvedInput({ pathOrUrlOrSchema: inputPath });

  let arrayBuffer: ArrayBuffer | undefined;
  // boolean signals whether the file has **definitely** changed
  let hasChanged: boolean | undefined;
  let response: Response | undefined;

  if (resolvedInput.type === 'url') {
    // do NOT send HEAD request on first run or if unsupported
    if (watch.lastValue && watch.isHeadMethodSupported !== false) {
      try {
        const request = await sendRequest({
          fetchOptions: {
            method: 'HEAD',
            ...fetchOptions,
            headers: mergeHeaders(fetchOptions?.headers, watch.headers),
          },
          timeout,
          url: resolvedInput.path,
        });

        if (request.response.status >= 300) {
          return {
            error: 'not-ok',
            response: request.response,
          };
        }

        response = request.response;
      } catch (error) {
        return {
          error: 'not-ok',
          response: new Response(error.message),
        };
      }

      if (!response.ok && watch.isHeadMethodSupported) {
        // assume the server is no longer running
        // do nothing, it might be restarted later
        return {
          error: 'not-ok',
          response,
        };
      }

      if (watch.isHeadMethodSupported === undefined) {
        watch.isHeadMethodSupported = response.ok;
      }

      if (response.status === 304) {
        return {
          error: 'not-modified',
          response,
        };
      }

      if (hasChanged === undefined) {
        const eTag = response.headers.get('ETag');
        if (eTag) {
          hasChanged = eTag !== watch.headers.get('If-None-Match');

          if (hasChanged) {
            watch.headers.set('If-None-Match', eTag);
          }
        }
      }

      if (hasChanged === undefined) {
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          hasChanged = lastModified !== watch.headers.get('If-Modified-Since');

          if (hasChanged) {
            watch.headers.set('If-Modified-Since', lastModified);
          }
        }
      }

      // we definitely know the input has not changed
      if (hasChanged === false) {
        return {
          error: 'not-modified',
          response,
        };
      }
    }

    try {
      const request = await sendRequest({
        fetchOptions: {
          method: 'GET',
          ...fetchOptions,
        },
        timeout,
        url: resolvedInput.path,
      });

      if (request.response.status >= 300) {
        return {
          error: 'not-ok',
          response: request.response,
        };
      }

      response = request.response;
    } catch (error) {
      return {
        error: 'not-ok',
        response: new Response(error.message),
      };
    }

    if (!response.ok) {
      // assume the server is no longer running
      // do nothing, it might be restarted later
      return {
        error: 'not-ok',
        response,
      };
    }

    arrayBuffer = response.body
      ? await response.arrayBuffer()
      : new ArrayBuffer(0);

    if (hasChanged === undefined) {
      const content = new TextDecoder().decode(arrayBuffer);
      hasChanged = content !== watch.lastValue;
      watch.lastValue = content;
    }
  } else {
    // we do not support watch mode for files or raw spec data
    if (!watch.lastValue) {
      watch.lastValue = resolvedInput.type;
    } else {
      hasChanged = false;
    }
  }

  if (hasChanged === false) {
    return {
      error: 'not-modified',
      response: response!,
    };
  }

  const data = await refParser.bundle({
    arrayBuffer,
    pathOrUrlOrSchema: undefined,
    resolvedInput,
  });

  return {
    data,
  };
};
