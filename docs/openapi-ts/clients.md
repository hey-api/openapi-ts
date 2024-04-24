---
title: Clients
description: REST clients for your stack. Compatible with all our features.
---

# REST Clients <span class="soon">Soon</span>

We all send HTTP requests in a slightly different way. Hey API doesn't force you to use any specific technology. What we do, however, is support your choice with great clients. All seamlessly integrated with our other features.

[Next.js](https://nextjs.org/), [Axios](https://axios-http.com/), and [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) coming soon.

## Legacy Clients

Before standalone client packages, clients were generated using `openapi-ts`. If you want to use a client that isn't published as a standalone package, you can explicitly set the `client` config option to generate it.

::: code-group

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

The following legacy clients are available:

- [angular](https://angular.io/) (using [RxJS](https://rxjs.dev/))
- [node](https://nodejs.org/) (using [node-fetch](https://www.npmjs.com/package/node-fetch))
- [xhr](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)

If you'd like a standalone package for your client, let us know by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

## Examples

You can view live examples on [StackBlitz](https://stackblitz.com/orgs/github/hey-api/collections/openapi-ts-examples).
