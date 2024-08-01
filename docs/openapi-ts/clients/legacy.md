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

```js{2} [fetch]
export default {
  client: 'fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [axios]
export default {
  client: 'axios',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [angular]
export default {
  client: 'angular',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [node]
export default {
  client: 'node',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [xhr]
export default {
  client: 'xhr',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
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

<!--@include: ../../examples.md-->
