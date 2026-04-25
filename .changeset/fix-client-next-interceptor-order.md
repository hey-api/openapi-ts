---
"@hey-api/openapi-ts": patch
---

**clients**: fix: build URL after request interceptors in `client-next`, and thread `finalError` through error interceptor chains in `client-next`, `client-ky`, and `client-fetch`

Two fixes to the generated client runtimes:

1. **`client-next`: request interceptor URL mutations are now honored.** Previously, the final request URL was computed before request interceptors ran, so mutations to `opts.baseUrl`, `opts.url`, `opts.path`, or `opts.query` inside a request interceptor were silently ignored. The URL is now built after the interceptor chain completes.

2. **`client-next`, `client-ky`, `client-fetch`: error interceptors now compose.** Previously each error interceptor was called with the *original* error, and only the final interceptor's return value survived — making a chain of error interceptors behave as if only the last one was installed. Each interceptor now receives the previous interceptor's output, matching how request and response interceptors already behave (and how `client-angular` and `client-ofetch` already worked).

> ⚠️ **Behavioral change for users with ≥2 error interceptors.** If you relied on the previous "only the last interceptor wins" behavior, you will see different error payloads after upgrading. Additionally, if any interceptor in the chain returns a falsy value (e.g. `undefined`), the accumulated error is cleared for the rest of the chain — interceptors should always return an error-shaped value.
