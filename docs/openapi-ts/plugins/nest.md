---
title: NestJS Plugin
description: Generate NestJS controller and service interfaces from OpenAPI with type safety. Fully compatible with all core features.
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

The NestJS plugin for Hey API generates type-safe controller and service method signatures from your OpenAPI spec, fully compatible with all core features.

## Features

- NestJS v10 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe controller methods via `implements`
- service interface types for the DI layer
- tag-based grouping for per-controller types
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

## Configuration

| Option       | Type      | Default | Description                                            |
| ------------ | --------- | ------- | ------------------------------------------------------ |
| `groupByTag` | `boolean` | `false` | Group methods by OpenAPI tag into per-controller types |

## Output

The NestJS plugin will generate the following artifacts, depending on the input specification.

## Controller Methods

By default, a single `ControllerMethods` type and a matching `ServiceMethods` type are generated from all endpoints.

::: code-group

```ts [output]
import type {
  ListPetsData,
  ListPetsResponse,
  ShowPetByIdData,
  ShowPetByIdResponse,
} from './types.gen';

export type ControllerMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};

export type ServiceMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
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

## Tag Grouping

When `groupByTag` is `true`, operations are grouped by their first OpenAPI tag into per-controller types. This is ideal for larger APIs with multiple controllers.

::: code-group

```ts [output]
export type PetsControllerMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};

export type PetsServiceMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
};

export type StoreControllerMethods = {
  getInventory: () => Promise<GetInventoryResponse>;
};

export type StoreServiceMethods = {
  getInventory: () => Promise<GetInventoryResponse>;
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      groupByTag: true,
      name: 'nestjs',
    },
  ],
};
```

:::

## Usage

Use `Pick<ControllerMethods, ...>` with `implements` to enforce the contract on your controllers.

```ts
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { PetsControllerMethods } from '../client/nestjs.gen';
import type { ListPetsData, ShowPetByIdData, CreatePetData } from '../client/types.gen';

@ApiTags('pets')
@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'listPets' | 'createPet' | 'showPetById'
> {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'List all pets' })
  @ApiResponse({ status: 200, description: 'A list of pets' })
  async listPets(@Query() query?: ListPetsData['query']) {
    return this.petsService.listPets(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pet' })
  @ApiResponse({ status: 201, description: 'Pet created' })
  async createPet(@Body() body: CreatePetDto) {
    return this.petsService.createPet(body);
  }

  @Get(':petId')
  @ApiOperation({ summary: 'Find pet by ID' })
  @ApiResponse({ status: 200, description: 'Pet found' })
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    return this.petsService.showPetById(path);
  }
}
```

## Production Example

The [openapi-ts-nestjs example](https://github.com/hey-api/openapi-ts/tree/main/examples/openapi-ts-nestjs) demonstrates a production-quality NestJS app with:

- `@nestjs/swagger` for OpenAPI documentation
- `class-validator` DTOs for request validation
- `ValidationPipe` with `forbidUnknownValues: true`
- Service layer with dependency injection
- Exception filters and guards
- `@darraghor/eslint-plugin-nestjs-typed` for NestJS-specific linting

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

Operations without tags are grouped under `DefaultControllerMethods` when `groupByTag` is `true`.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/nestjs/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
