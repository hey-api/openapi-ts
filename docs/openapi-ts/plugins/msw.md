---
title: MSW
description: MSW plugin for Hey API. Compatible with all our features.
---

<script setup lang="ts">
</script>

# MSW

### About

[MSW](https://mswjs.io) is an API mocking library that allows you to write client-agnostic mocks and reuse them across any frameworks, tools, and environments.

The MSW plugin for Hey API generates type-safe mock handler factories from your OpenAPI spec, removing the tedious work of defining mock endpoints and ensuring your mocks stay in sync with your API.

## Features

- type-safe mock handlers generated from your OpenAPI spec
- seamless integration with `@hey-api/openapi-ts` ecosystem
- support for static response values or custom MSW resolver functions
- Helper to generate handlers for every operation at once
- typed path parameters and request bodies
- minimal learning curve thanks to extending the underlying technology

## Installation

::: warning
MSW plugin requires `msw@^2` as a peer dependency. Make sure to install it in your project.
:::

In your [configuration](/openapi-ts/get-started), add `msw` to your plugins and you'll be ready to generate MSW artifacts. :tada:

```js
export default {
  // ...other options
  plugins: [
    // ...other plugins
    'msw', // [!code ++]
  ],
};
```

## Output

The MSW plugin will generate a `msw.gen.ts` file containing the following artifacts.

### Handler Exports

Each operation is exported as a handler creator named `<operationId>Mock`. These use a wildcard (`*`) base URL so they match requests regardless of origin. A `getAllMocks` function is also exported.

```ts
import { getPetByIdMock, getAllMocks } from './client/msw.gen';
```

## Usage

### Static Response

The simplest way to mock an endpoint is to provide a static response object with a `result` property. The `status` property is optional — when omitted, it defaults to the operation's dominant success status code (e.g. `200`).

```ts
import { setupServer } from 'msw/node';
import { getPetByIdMock } from './client/msw.gen';

const mockServer = setupServer(
  // result only — status defaults to the dominant success code (200)
  getPetByIdMock({ result: { id: 1, name: 'Fido' } }),

  // explicit status code
  getPetByIdMock({ status: 200, result: { id: 1, name: 'Fido' } }),

  // type error if result type is incorrect
  // @ts-expect-error
  getPetByIdMock({ result: 'wrong type' }),
);
```

### Custom Resolver

For more control, pass an MSW `HttpResponseResolver` function. The resolver receives typed path parameters and request body when available.

```ts
import { delay, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getPetByIdMock, updatePetMock } from './client/msw.gen';

const mockServer = setupServer(
  // custom resolver with typed params and body
  updatePetMock(async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: Number(params.petId), ...body }, { status: 200 });
  }),

  // async resolver with delay
  getPetByIdMock(async () => {
    await delay(100);
    return HttpResponse.json({ id: 1, name: 'Fido' });
  }),
);
```

::: tip
Path parameters are typed as `string` because MSW normalizes all path parameters to strings. Use `Number()` or similar conversions if you need numeric values.
:::

### Operations Without Responses

For operations that don't define a response type, the handler creator can be invoked without arguments or with a custom resolver function.

```ts
import { deletePetMock } from './client/msw.gen';

const mockServer = setupServer(
  deletePetMock(),

  deletePetMock(() => new HttpResponse(null, { status: 204 })),
);
```

### Response Examples

When your OpenAPI spec includes response examples, the generated handlers will use them as default values. This means you can call the handler without arguments and it will return the example response automatically.

```ts
import { getFooMock } from './client/msw.gen';

const mockServer = setupServer(
  // uses the example response from the OpenAPI spec as default
  getFooMock(),

  // you can still override with a custom response
  getFooMock({ result: { name: 'Custom' } }),
);
```

By default, `valueSources` is set to `['example']`, which embeds OpenAPI examples in the generated output. To disable this, set `valueSources` to an empty array.

::: code-group

```js [config]
export default {
  // ...other options
  plugins: [
    // ...other plugins
    {
      name: 'msw',
      valueSources: [], // [!code ++]
    },
  ],
};
```

:::

### All Handlers (`getAllMocks`)

The `getAllMocks` function generates handlers for all operations at once. This is useful for quickly setting up a mock server without manually listing each operation.

```ts
import { setupServer } from 'msw/node';
import { getAllMocks } from './client/msw.gen';

const server = setupServer(...getAllMocks());
```

#### `onMissingMock`

Some operations require a response argument (because they have no default example value). The `onMissingMock` option controls what happens for these operations:

- `'skip'` (default) — skips handlers that require an argument, only including operations that have default values or no response type
- `'error'` — includes all handlers, but operations without a provided response return a `501` error with the message `'[heyapi-msw] The mock of this request is not implemented.'`

```ts
// strict mode: all endpoints are mocked, missing ones return 501
const server = setupServer(...getAllMocks({ onMissingMock: 'error' }));
```

#### `overrides`

Use `overrides` to provide static responses for specific operations. The keys are handler names (operation ID suffixed with `Mock`) and the values are the same as what you'd pass to the individual handler creator.

```ts
import { setupServer } from 'msw/node';
import { getAllMocks } from './client/msw.gen';

const server = setupServer(
  ...getAllMocks({
    onMissingMock: 'skip',
    overrides: {
      getPetByIdMock: {
        result: { id: 1, name: 'Fido', photoUrls: [] },
      },
    },
  }),
);
```

When an override is provided for a required handler, it will always be included regardless of the `onMissingMock` setting.

### Custom Base URL

The individually exported handlers use a wildcard (`*`) base URL that matches requests regardless of origin. If you need handlers bound to a specific base URL, use the `createMswHandlerFactory` function:

```ts
import { setupServer } from 'msw/node';
import { createMswHandlerFactory } from './client/msw.gen';

const createMock = createMswHandlerFactory({
  baseUrl: 'http://localhost:8000',
});

const server = setupServer(createMock.getPetByIdMock({ result: { id: 1, name: 'Fido' } }));
```

When called without arguments, the factory infers the base URL from the OpenAPI spec's `servers` field.

### Handler Options

[Handler options](https://mswjs.io/docs/api/http#handler-options) can be provided. The object will be passed on to MSW helpers.

```ts
const mockServer = setupServer(getPetByIdMock({ result: { id: 1, name: 'Fido' } }, { once: true }));
```

## Known Limitations

- Query parameters are not typed in the resolver. MSW doesn't provide typed query params natively — use `new URL(request.url).searchParams` instead.
- The response type generic is omitted from `HttpResponseResolver` to avoid MSW's `DefaultBodyType` constraint issues with union and void response types.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/msw/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
