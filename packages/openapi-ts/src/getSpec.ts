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
  inputPaths,
  timeout,
  watch,
}: {
  fetchOptions?: RequestInit;
  inputPaths: Array<Config['input']['path']>;
  timeout: number;
  watch: WatchValues;
}): Promise<SpecResponse | SpecError> => {
  const refParser = new $RefParser();
  const resolvedInputs = inputPaths.map((inputPath) =>
    getResolvedInput({ pathOrUrlOrSchema: inputPath }),
  );

  const arrayBuffer: ArrayBuffer[] = [];
  let anyChanged = false;
  let lastResponse: Response | undefined;
  watch.inputs = watch.inputs || {};

  for (const resolvedInput of resolvedInputs) {
    let hasChanged: boolean | undefined;
    let response: Response | undefined;

    const key = `${resolvedInput.type}:${resolvedInput.path ?? ''}`;
    const state = (watch.inputs[key] = watch.inputs[key] || {
      headers: new Headers(),
    });

    if (resolvedInput.type === 'url') {
      if (state.lastValue && state.isHeadMethodSupported !== false) {
        try {
          const request = await sendRequest({
            fetchOptions: {
              method: 'HEAD',
              ...fetchOptions,
              headers: mergeHeaders(fetchOptions?.headers, state.headers),
            },
            timeout,
            url: resolvedInput.path,
          });

          lastResponse = request.response;

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
            response: new Response((error as Error).message),
          };
        }

        if (response.status === 304) {
          hasChanged = false;
        } else if (!response.ok && state.isHeadMethodSupported) {
          return {
            error: 'not-ok',
            response,
          };
        }

        if (state.isHeadMethodSupported === undefined) {
          state.isHeadMethodSupported = response.ok;
        }

        if (hasChanged === undefined) {
          const eTag = response.headers.get('ETag');
          if (eTag) {
            hasChanged = eTag !== state.headers.get('If-None-Match');
            if (hasChanged) {
              state.headers.set('If-None-Match', eTag);
            } else {
              // Definitely not changed based on ETag
              hasChanged = false;
            }
          }
        }

        if (hasChanged === undefined) {
          const lastModified = response.headers.get('Last-Modified');
          if (lastModified) {
            hasChanged =
              lastModified !== state.headers.get('If-Modified-Since');
            if (hasChanged) {
              state.headers.set('If-Modified-Since', lastModified);
            } else {
              hasChanged = false;
            }
          }
        }

        if (hasChanged === false && state.lastValue !== undefined) {
          // Use cached content without GET
          const encoded = new TextEncoder().encode(state.lastValue);
          const cachedBuffer = new ArrayBuffer(encoded.byteLength);
          new Uint8Array(cachedBuffer).set(encoded);
          arrayBuffer.push(cachedBuffer);
          anyChanged = anyChanged || false;
          continue;
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

        lastResponse = request.response;

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
          response: new Response((error as Error).message),
        };
      }

      if (!response.ok) {
        return {
          error: 'not-ok',
          response,
        };
      }

      const lastBuffer = response.body
        ? await response.arrayBuffer()
        : new ArrayBuffer(0);
      arrayBuffer.push(lastBuffer);

      if (hasChanged === undefined) {
        const content = new TextDecoder().decode(lastBuffer);
        hasChanged = content !== state.lastValue;
        state.lastValue = content;
      } else if (hasChanged) {
        // Update lastValue since it changed
        const content = new TextDecoder().decode(lastBuffer);
        state.lastValue = content;
      }
    } else {
      // we do not support watch mode for files or raw spec data
      if (!state.lastValue) {
        state.lastValue = resolvedInput.type;
      } else {
        hasChanged = false;
      }
      // Maintain alignment with resolvedInputs
      arrayBuffer.push(new ArrayBuffer(0));
    }

    anyChanged = anyChanged || hasChanged !== false;
  }

  let data: JSONSchema;
  if (resolvedInputs.length === 1) {
    data = await refParser.bundle({
      arrayBuffer: arrayBuffer[0],
      pathOrUrlOrSchema: undefined,
      resolvedInput: resolvedInputs[0],
    });
  } else {
    data = await refParser.bundleMany({
      arrayBuffer,
      pathOrUrlOrSchemas: [],
      resolvedInputs,
    });
  }
  if (!anyChanged) {
    return {
      error: 'not-modified',
      response: lastResponse || new Response('', { status: 304 }),
    } as SpecError;
  }
  return { data };
};
