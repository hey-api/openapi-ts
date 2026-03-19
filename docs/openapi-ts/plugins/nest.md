---
title: NestJS v11 Plugin
description: Generate NestJS v11 controller methods from OpenAPI with the NestJS plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import AuthorsList from '@components/AuthorsList.vue';
import Examples from '@components/Examples.vue';
import Heading from '@components/Heading.vue';
import { yuriMikhin } from '@data/people.js';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>NestJS<span class="sr-only"> v11</span></h1>
  <VersionLabel value="v11" />
</Heading>

::: warning
NestJS plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[Nest](https://nestjs.com) is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.

The NestJS plugin for Hey API generates type-safe controller method signatures from your OpenAPI spec, fully compatible with all core features.

### Collaborators

<AuthorsList :people="[yuriMikhin]" />

## Features

- NestJS v11 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe controller methods
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `nestjs` to your plugins and you'll be ready to generate NestJS artifacts. :tada:

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

The NestJS plugin will generate the following artifacts, depending on the input specification.

## Controller Methods

Operations are grouped by their first tag into separate types.

::: code-group

```ts [example]
export type PetsControllerMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};

export type StoreControllerMethods = {
  getInventory: () => Promise<GetInventoryResponse>;
};
```

```ts [usage]
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import type { PetsControllerMethods } from '../client/nestjs.gen';
import type { CreatePetData, ListPetsData, ShowPetByIdData } from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'createPet' | 'listPets' | 'showPetById'
> {
  @Post()
  async createPet(@Body() body: CreatePetData['body']) {}

  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {}

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {}
}
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/nestjs/types.ts) interface.

<Examples githubExamplePath="/openapi-ts-nestjs" />

<!--@include: ../../partials/sponsors.md-->
