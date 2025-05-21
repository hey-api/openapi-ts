import type {
  DefaultBodyType,
  HttpHandler,
  HttpResponseResolver,
  PathParams,
} from 'msw';
import { http as mswhttp, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { expect, onTestFinished, vi } from 'vitest';

export const { error, formData, html, json, redirect, text } = HttpResponse;

export type HandlerPair<
  ReqT extends DefaultBodyType = DefaultBodyType,
  ResT extends DefaultBodyType = DefaultBodyType,
> = {
  handler: HttpResponseResolver<PathParams<string>, ReqT, ResT>;
  method:
    | 'all'
    | 'delete'
    | 'get'
    | 'head'
    | 'options'
    | 'patch'
    | 'post'
    | 'put';
};

export type SpyHandler = {
  handler: HttpHandler;
  spy: ReturnType<typeof vi.fn>;
};

// type ExtractPathValues<P extends string, T extends SpyHandler<P>[]> = T[number]['path'];

/**
 * Create a mock handler -- automatically wraps the handler in a vitest spy
 * and returns a handler that can be used with msw.
 * @param method - The method to use.
 * @param path - The path to use.
 * @param handler - The handler to use.
 * @returns A spy mock handler.
 */
export const handle = <
  ReqT extends DefaultBodyType = DefaultBodyType,
  ResT extends DefaultBodyType = DefaultBodyType,
>(
  method: HandlerPair<ReqT, ResT>['method'],
  path: string,
  handler: HandlerPair<ReqT, ResT>['handler'],
): SpyHandler => {
  const spy = vi.fn(handler);
  let finalHandler: HttpHandler;
  switch (method) {
    case 'all':
      finalHandler = mswhttp.all(path, spy);
      break;
    case 'delete':
      finalHandler = mswhttp.delete(path, spy);
      break;
    case 'get':
      finalHandler = mswhttp.get(path, spy);
      break;
    case 'head':
      finalHandler = mswhttp.head(path, spy);
      break;
    case 'options':
      finalHandler = mswhttp.options(path, spy);
      break;
    case 'patch':
      finalHandler = mswhttp.patch(path, spy);
      break;
    case 'post':
      finalHandler = mswhttp.post(path, spy);
      break;
    case 'put':
      finalHandler = mswhttp.put(path, spy);
      break;
    default:
      throw new Error(`Unknown method: ${method}`);
  }

  return {
    handler: finalHandler,
    spy,
  };
};

/**
 * Create a mock server that uses service workers (msw) to intercept requests.
 * Automatically starts the server, and cleans up after the test. Note that this
 * can only be invoked by default when inside of a vitest `test()` or `it()`
 * block.
 *
 * @param handlers - The handlers to use.
 * @param opts - The options to use.
 * @returns A mock server. Started automatically.
 */
export const newServer = (
  handlers: SpyHandler[],
  opts?: { errOnUnknown: boolean; noStart: boolean },
) => {
  if (!handlers.length) {
    throw new Error('No handlers provided');
  }

  const server = setupServer(...handlers.map((h) => h.handler));

  server.events.on('request:start', ({ request }) => {
    console.log(
      `[${expect.getState().currentTestName ?? 'unknown'}] request started: ${request.method} ${request.url}`,
    );
  });
  server.events.on('response:mocked', ({ request, response }) => {
    console.log(
      `[${expect.getState().currentTestName ?? 'unknown'}] request ended: ${request.method} ${request.url} - ${response.status}`,
    );
  });
  server.events.on('unhandledException', ({ error, request }) => {
    console.error(
      `[${expect.getState().currentTestName ?? 'unknown'}] request exception: ${request.method} ${request.url}: ${error}`,
    );
  });

  const listen = () => {
    server.listen({
      onUnhandledRequest: !opts || opts.errOnUnknown ? 'error' : 'bypass',
    });
    onTestFinished(() => server.close());
  };

  if (!opts?.noStart) listen();

  return {
    /**
     * Expect all handlers to have been called, or fail.
     */
    expectAllCalled: () => {
      handlers.forEach((h) => {
        expect(
          h.spy,
          h.handler.info.method + ' ' + h.handler.info.path,
        ).toHaveBeenCalled();
      });
    },
    handlers,
    /**
     * Reset all spy watchers.
     */
    resetAllSpy: () => handlers.forEach((h) => h.spy.mockReset()),
    server,
    /**
     * Get the spy for a handler.
     * @param method - The method to match against.
     * @param path - The path to use (don't include base url).
     * @returns A spy for the handler.
     */
    spy: (method: HandlerPair['method'], path: string) => {
      const handler = handlers.find((h) => {
        const hpath = new URL(h.handler.info.path.toString()).pathname;

        if (
          hpath === path &&
          (h.handler.info.method.toString().toLowerCase() ===
            method.toString() ||
            h.handler.info.method.toString() == '/.+/')
        ) {
          return true;
        }
      });
      if (!handler) {
        throw new Error('Handler not found');
      }
      return handler.spy;
    },
    /**
     * Start the server. This is not required by default. Can only be invoked
     * inside of vitest `test()` or `it()` blocks, as it's setup to auto-cleanup
     * after test completion.
     */
    start: listen,
  };
};
