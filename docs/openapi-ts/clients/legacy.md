---
title: Legacy clients
description: Legacy client for your stack.
---

<script setup>
import { embedProject } from '../../embed'
</script>

# Legacy Clients

Before standalone client packages, clients were generated using `@hey-api/openapi-ts`. In fact, `@hey-api/openapi-ts` still supports generating legacy clients. You can generate them with the `client` config option.

::: code-group

```js [fetch]
export default {
  client: 'fetch', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [axios]
export default {
  client: 'axios', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [angular]
export default {
  client: 'angular', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [node]
export default {
  client: 'node', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [xhr]
export default {
  client: 'xhr', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

:::

## Available Clients

- [angular](https://angular.io/) (using [RxJS](https://rxjs.dev/))
- [axios](https://axios-http.com/)
- [fetch](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [node](https://nodejs.org/) (using [node-fetch](https://www.npmjs.com/package/node-fetch))
- [xhr](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)

## Caveats

Please be aware that legacy clients are missing some key features:

- no typesafe errors 🚫
- no access to the original request and response 🚫
- hard to configure individual requests 👎
- inconsistent interceptors and response APIs 👎

::: tip
You might not need a `node` client. Fetch API is [experimental](https://nodejs.org/docs/latest-v18.x/api/globals.html#fetch) in Node.js v18 and [stable](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch) in Node.js v21. We recommend upgrading to the latest Node.js version.
:::

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to the rest of your application.

Below is an example request interceptor

::: code-group

```js [use]
OpenAPI.interceptors.request.use((request) => {
  doSomethingWithRequest(request);
  return request; // <-- must return request
});
```

```js [eject]
OpenAPI.interceptors.request.eject((request) => {
  doSomethingWithRequest(request);
  return request; // <-- must return request
});
```

:::

and an example response interceptor

::: code-group

```js [use]
OpenAPI.interceptors.response.use(async (response) => {
  await doSomethingWithResponse(response); // async
  return response; // <-- must return response
});
```

```js [eject]
OpenAPI.interceptors.response.eject(async (response) => {
  await doSomethingWithResponse(response); // async
  return response; // <-- must return response
});
```

:::

::: tip
To eject, you must provide the same function that was passed to `use()`.
:::

::: warning
Angular client does not currently support request interceptors.
:::

<!--@include: ../../examples.md-->
<!--@include: ../../sponsorship.md-->
