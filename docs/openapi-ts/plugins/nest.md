---
title: NestJS Plugin
description: Generate NestJS controller interfaces from OpenAPI with type safety. Fully compatible with all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>NestJS</h1>
  <VersionLabel value="v10" />
</Heading>

::: warning
NestJS plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[NestJS](https://nestjs.com) is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.

The NestJS plugin for Hey API generates type-safe controller method signatures from your OpenAPI spec, fully compatible with all core features.

## Features

- NestJS v10 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe controller methods via `implements`
- incremental adoption with `Pick<ControllerMethods, ...>`
- zero runtime coupling — pure TypeScript types
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

A single `ControllerMethods` type is generated from all endpoints. The method signatures follow the naming convention of SDK functions.

::: code-group

```ts [output]
import type {
  ListPetsData,
  ListPetsResponse,
  ShowPetByIdData,
  ShowPetByIdResponse,
} from './types.gen';

export type ControllerMethods = {
  createPets: () => Promise<void>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'nestjs',
    },
  ],
};
```

:::

## Usage

Use `Pick<ControllerMethods, ...>` with `implements` to enforce the contract on your controllers.

```ts
import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import type { ControllerMethods } from '../client/nestjs.gen';
import type { ListPetsData, ShowPetByIdData } from '../client/types.gen';

@Controller('pets')
export class PetsController implements Pick<
  ControllerMethods,
  'listPets' | 'createPets' | 'showPetById'
> {
  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    return [];
  }

  @Post()
  async createPets() {
    return;
  }

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    return { id: Number(path.petId), name: 'Kitty' };
  }
}
```

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

Methods using `@Res()` for raw response access are incompatible with `implements` because the extra parameter breaks assignability.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/nestjs/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
