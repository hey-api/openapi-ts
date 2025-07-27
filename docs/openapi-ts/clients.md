---
title: Clients
description: REST clients for Hey API. Compatible with all our features.
---

<script setup lang="ts">
import { embedProject } from '../embed'
</script>

# REST Clients

We all send HTTP requests in a slightly different way. Hey API doesn't force you to use any specific technology. What we do, however, is support your choice with great clients. All seamlessly integrated with our other features.

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Options

Hey API natively supports the following clients.

- [Fetch API](/openapi-ts/clients/fetch)
- [Axios](/openapi-ts/clients/axios)
- [Next.js](/openapi-ts/clients/next-js)
- [Nuxt](/openapi-ts/clients/nuxt)
- [Effect](/openapi-ts/clients/effect) <span data-soon>Soon</span>
- [Legacy](/openapi-ts/clients/legacy)

Don't see your client? [Build your own](/openapi-ts/clients/custom) or let us know your interest by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

<!--@include: ../partials/examples.md-->
<!--@include: ../partials/sponsors.md-->
