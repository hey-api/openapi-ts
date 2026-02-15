# NestJS Plugin Research & Requirements

## Context

Investigate NestJS plugin following Fastify plugin pattern. Generate type-safe controller interfaces from OpenAPI specs for NestJS applications.

## Fastify Baseline

**Current implementation:**

- Location: `packages/openapi-ts/src/plugins/fastify/`
- Output: `RouteHandlers` interface mapping operation IDs to typed handlers
- Pattern: `RouteHandler<{ Body?, Headers?, Params?, Querystring?, Reply }>`
- Size: ~155 lines core logic
- Deps: `@hey-api/typescript` plugin
- Runtime: Uses `fastify-openapi-glue` library for route registration
- Example: `examples/openapi-ts-fastify/`
- Docs: `docs/openapi-ts/plugins/fastify.md` (~100 lines)

## NestJS vs Fastify

| Aspect            | Fastify                | NestJS                                           |
| ----------------- | ---------------------- | ------------------------------------------------ |
| **Style**         | Functional handlers    | Class-based controllers                          |
| **Typing**        | Type generics          | DTOs + decorators                                |
| **DI**            | Manual                 | Built-in container                               |
| **Runtime lib**   | `fastify-openapi-glue` | `@nestjs/swagger`                                |
| **Module system** | None (flat object)     | `@Module` required                               |
| **Parameters**    | Generic types          | Decorator metadata (`@Param`, `@Query`, `@Body`) |

## Research Questions

### High Priority (MVP)

**1. Output Format**

- Option A: Generate controller interface (recommended - mirrors Fastify pattern)
- Option B: Generate controller class with decorators
- Option C: Generate decorator metadata types

**Recommendation**: Controller interface. Simple, type-safe, lets devs write decorators.

**2. Method Mapping**

- Map operation IDs to camelCase method names (matches SDK functions)
- Example: `GET /pets` with operationId `listPets` → `listPets()` method

**3. Type Structure**
Request parameters:

- Path params: `operation.parameters.path` → method param type
- Query params: `operation.parameters.query` → method param type
- Request body: `operation.body` → method param type
- Headers: `operation.parameters.header` → method param type

Response:

- Success responses: `operation.responses` → Promise return type
- Error responses: Include in union type

**4. Platform Support**

- NestJS supports both Express and Fastify adapters
- Generated types should be adapter-agnostic
- Let runtime decorators handle platform differences

### Medium Priority (Future)

**5. @nestjs/swagger Integration**

- Current: Generate standalone types
- Future: Optionally generate `@ApiResponse()`, `@ApiOperation()` decorators
- Requires config flag: `generateDecorators?: boolean`

**6. Validation**

- Current: Type-only validation via TypeScript
- Future: Generate `class-validator` decorators in DTOs
- Requires config flag: `generateValidation?: boolean`

**7. Module Generation**

- Current: Generate controller interface only
- Future: Generate full `@Module()` setup
- Requires config option: `moduleGeneration?: 'interface' | 'class' | 'module'`

**8. DI Layer**

- Current: Controller interface only
- Future: Generate service interfaces for business logic separation
- Common NestJS pattern: Controllers → Services → Repositories

### Low Priority (v2+)

9. Guards/interceptors/pipes type generation
10. Exception filters for typed error responses
11. SwaggerModule auto-configuration
12. Validation pipe integration

## Proposed MVP Output

### Generated Interface

```typescript
// client/nestjs.gen.ts
import type {
  ListPetsData,
  ListPetsResponses,
  CreatePetsData,
  CreatePetsResponses,
  ShowPetByIdData,
  ShowPetByIdResponses,
} from './types.gen';

export interface PetsController {
  listPets(query?: ListPetsData['query']): Promise<ListPetsResponses>;
  createPets(body: CreatePetsData['body']): Promise<CreatePetsResponses>;
  showPetById(params: ShowPetByIdData['path']): Promise<ShowPetByIdResponses>;
}
```

### Usage Pattern

```typescript
// controllers/pets.controller.ts
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import type { PetsController } from '../client/nestjs.gen';

@Controller('pets')
export class PetsControllerImpl implements PetsController {
  @Get()
  async listPets(@Query() query?) {
    return [];
  }

  @Post()
  async createPets(@Body() body) {
    return { id: 1 };
  }

  @Get(':petId')
  async showPetById(@Param() params) {
    return { id: params.petId, name: 'Kitty' };
  }
}
```

## Example Structure

```
examples/openapi-ts-nestjs/
├── openapi-ts.config.ts      # plugins: ['nestjs', '@hey-api/sdk']
├── openapi.json              # Petstore spec (same as Fastify example)
├── package.json              # @nestjs/core, @nestjs/common, @nestjs/platform-express
├── src/
│   ├── client/
│   │   ├── nestjs.gen.ts     # Generated controller interface
│   │   ├── types.gen.ts      # Shared types (from TypeScript plugin)
│   │   ├── sdk.gen.ts        # Client SDK (from SDK plugin)
│   │   └── index.ts
│   ├── controllers/
│   │   └── pets.controller.ts  # Implements PetsController interface
│   ├── app.module.ts         # NestJS module setup
│   └── main.ts               # Bootstrap app
└── test/
    └── pets.test.ts          # Supertest integration tests
```

## Documentation Structure

Mirror Fastify docs style (~100 lines):

````markdown
---
title: NestJS Plugin
description: Generate NestJS controller interfaces from OpenAPI with type safety
---

# NestJS

::: warning
NestJS plugin is currently in beta. Interface might change before stable.
:::

## About

[NestJS](https://nestjs.com) is a progressive Node.js framework for building
efficient, reliable server-side applications.

The NestJS plugin generates type-safe controller interfaces from OpenAPI specs.

## Features

- NestJS v10 support
- seamless integration with @hey-api/openapi-ts ecosystem
- type-safe controller interfaces
- minimal learning curve

## Installation

Add `nestjs` to your plugins:

```js
export default {
  input: 'openapi.json',
  output: 'src/client',
  plugins: [
    'nestjs', // [!code ++]
  ],
};
```
````

## Output

### Controller Types

Generated controller interfaces from all endpoints. Follows SDK naming conventions.

::: code-group

```ts [example]
import { Controller, Get, Post } from '@nestjs/common';
import type { PetsController } from '../client/nestjs.gen';

@Controller('pets')
export class PetsControllerImpl implements PetsController {
  @Get()
  async listPets(query?) {
    return [];
  }

  @Post()
  async createPets(body) {
    return { id: 1 };
  }
}
```

```js [config]
export default {
  input: 'openapi.json',
  output: 'src/client',
  plugins: [
    {
      name: 'nestjs',
    },
  ],
};
```

:::

## API

See [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/nestjs/types.ts).

````

## Dependencies

### Plugin (dev)
- `@hey-api/typescript` - Base type generation (required dependency)

### Example (runtime)
- `@nestjs/core` (^10.0.0)
- `@nestjs/common` (^10.0.0)
- `@nestjs/platform-express` (^10.0.0) or `@nestjs/platform-fastify`

### Optional (future)
- `@nestjs/swagger` - For decorator generation
- `class-validator` - For DTO validation decorators
- `class-transformer` - For DTO transformation

## Implementation Approach

1. **Copy Fastify plugin structure** as baseline:
   - `packages/openapi-ts/src/plugins/nestjs/plugin.ts`
   - `packages/openapi-ts/src/plugins/nestjs/types.ts`
   - `packages/openapi-ts/src/plugins/nestjs/config.ts`
   - `packages/openapi-ts/src/plugins/nestjs/index.ts`

2. **Adapt type generation** for controller interface pattern:
   - Iterate operations via `plugin.forEach('operation')`
   - Extract request params (path, query, body, headers)
   - Extract response types
   - Generate method signature with typed params and Promise return

3. **Parameter mapping**:
   ```typescript
   // For each operation:
   {
     methodName: operationId,
     params: [
       ...(hasPathParams ? ['params: OperationData["path"]'] : []),
       ...(hasQueryParams ? ['query?: OperationData["query"]'] : []),
       ...(hasBody ? ['body: OperationData["body"]'] : []),
       ...(hasHeaders ? ['headers?: OperationData["headers"]'] : []),
     ],
     returns: 'Promise<OperationResponses>'
   }
````

4. **Generate interface**:

   ```typescript
   export interface {ControllerName}Controller {
     operation1(...params): Promise<Response1>;
     operation2(...params): Promise<Response2>;
   }
   ```

5. **Create example** at `examples/openapi-ts-nestjs/`

6. **Write docs** at `docs/openapi-ts/plugins/nestjs.md`

## Deferred Features (v2+)

- Full `@ApiResponse()`, `@ApiOperation()` decorator generation
- `class-validator` decorators in generated DTOs
- Full module generation with `@Module()` decorator
- Service interface generation for DI layer
- Guard/interceptor/pipe type generation
- Exception filter types
- SwaggerModule auto-configuration

## Critical Files Reference

**Study for implementation:**

- `/Users/undgrnd/Code/openapi-ts/packages/openapi-ts/src/plugins/fastify/plugin.ts` - Core logic template
- `/Users/undgrnd/Code/openapi-ts/packages/openapi-ts/src/plugins/fastify/types.ts` - UserConfig pattern
- `/Users/undgrnd/Code/openapi-ts/packages/openapi-ts/src/plugins/fastify/config.ts` - Plugin registration
- `/Users/undgrnd/Code/openapi-ts/examples/openapi-ts-fastify/src/handlers.ts` - Handler pattern
- `/Users/undgrnd/Code/openapi-ts/docs/openapi-ts/plugins/fastify.md` - Docs template

## Next Steps

1. Review this research doc
2. Clarify any open questions with team
3. Get approval for MVP scope (controller interface only)
4. Proceed with implementation following Fastify plugin structure
