---
title: Interceptors
description: Understanding interceptors.
---

# Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to the rest of your application. Below is an example request interceptor

::: code-group

```ts [use]
OpenAPI.interceptors.request.use(request => {
  doSomethingWithRequest(request)
  return request // <-- must return request
})
```

```ts [eject]
OpenAPI.interceptors.request.eject(request => {
  doSomethingWithRequest(request)
  return request // <-- must return request
})
```

:::

and an example response interceptor

::: code-group

```ts [use]
OpenAPI.interceptors.response.use(async response => {
  await doSomethingWithResponse(response) // async
  return response // <-- must return response
})
```

```ts [eject]
OpenAPI.interceptors.response.eject(async response => {
  await doSomethingWithResponse(response) // async
  return response // <-- must return response
})
```

:::

::: tip
To eject, you must provide the same function that was passed to `use()`.
:::

::: warning
Angular client does not currently support request interceptors.
:::
