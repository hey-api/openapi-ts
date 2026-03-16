---
title: NestJS Plugin
description: Generate NestJS controller method types from OpenAPI specs. Type-safe controllers via implements.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>NestJS</h1>
  <VersionLabel value="v11" />
</Heading>

::: warning
NestJS plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

The NestJS plugin generates type-safe controller method signatures from your OpenAPI spec.

## Features

- type-safe controller methods via `implements`
- tag-based grouping for per-controller types
- incremental adoption with `Pick<ControllerMethods, ...>`
- zero runtime coupling — pure TypeScript types

## Installation

In your [configuration](/openapi-ts/get-started), add `nestjs` to your plugins.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    'nestjs', // [!code ++]
  ],
};
```

## Output

Operations are grouped by their first OpenAPI tag into separate types like `PetsControllerMethods`, `StoreControllerMethods`, etc.

```ts
export type PetsControllerMethods = {
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};

export type StoreControllerMethods = {
  getInventory: () => Promise<GetInventoryResponse>;
};
```

## Usage

```ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { PetsControllerMethods } from '../client/nestjs.gen';
import type { CreatePetData, ListPetsData, ShowPetByIdData } from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'createPet' | 'listPets' | 'showPetById'
> {
  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    // ...
  }

  @Post()
  async createPet(@Body() body: CreatePetData['body']) {
    // ...
  }

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    // ...
  }
}
```

## Example

The [openapi-ts-nestjs example](https://github.com/hey-api/openapi-ts/tree/main/examples/openapi-ts-nestjs) demonstrates the plugin with a minimal NestJS v11 app featuring two controllers and integration tests.

## Constraints

The `implements` pattern requires **whole-object parameter style** with NestJS decorators:

```ts
// WORKS with implements - whole-object style (recommended)
@Get(':petId')
async showPetById(@Param() path: ShowPetByIdData['path']) { ... }

// DOES NOT WORK with implements - decomposed style
@Get(':petId')
async showPetById(@Param('petId') petId: string) { ... }
```

- Methods using `@Res()` for raw response access are incompatible — the extra parameter breaks assignability
- Operations without tags are grouped under `DefaultControllerMethods`
- Cookie parameters are not included in generated signatures — NestJS handles cookies via `@Req()` or dedicated middleware

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
