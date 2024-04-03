---
title: Interceptors
description: Understanding interceptors.
---

# Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to the rest of your application. Below is an example request interceptor

```ts
OpenAPI.interceptors.request.use((request) => {
  doSomethingWithRequest(request)
  return request // <-- must return request
})
```

and an example response interceptor

```ts
OpenAPI.interceptors.response.use(async (response) => {
  await doSomethingWithResponse(response) // async
  return response // <-- must return response
})
```

If you need to remove an interceptor, pass the same function to `OpenAPI.interceptors.request.eject()` or `OpenAPI.interceptors.response.eject()`.

::: warning
Angular client does not currently support request interceptors.
:::
