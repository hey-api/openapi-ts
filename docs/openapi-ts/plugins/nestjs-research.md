# NestJS Plugin Research & Requirements

## Context

Investigate NestJS plugin following Fastify plugin pattern. Generate type-safe controller method types from OpenAPI specs for NestJS applications.

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

### High Priority (MVP) -- Resolved

**1. Output Format**

- **Decided**: Per-tag `type` aliases (e.g., `PetsControllerMethods`, `StoreControllerMethods`)
- Rationale: Tag-based grouping maps naturally to NestJS's one-controller-per-resource pattern. `type` aliases work with `implements` in TypeScript just like `interface`.

**2. Method Mapping**

- Map operation IDs to camelCase method names (matches SDK functions)
- Example: `GET /pets` with operationId `listPets` → `listPets()` method

**3. Type Structure**
Request parameters:

- Path params: `operation.parameters.path` → method param type
- Query params: `operation.parameters.query` → method param type
- Request body: `operation.body` → method param type
- Headers: `operation.parameters.header` → method param type
- **Parameter ordering**: Required params sorted before optional params

Response:

- Success responses: `operation.responses` → `Promise<OperationResponse>` return type (union of success bodies)
- Error responses: Excluded — NestJS handles errors via exception filters
- No response body (204): Returns `Promise<void>`

**4. Platform Support**

- NestJS supports both Express and Fastify adapters
- Generated types are adapter-agnostic
- Runtime decorators handle platform differences

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

- Current: Generate controller method types only
- Future: Generate full `@Module()` setup
- Requires config option: `moduleGeneration?: 'type' | 'class' | 'module'`

**8. DI Layer**

- Current: Controller method types only
- Future: Generate service interfaces for business logic separation
- Note: `ServiceMethods` was prototyped and removed — added complexity without clear value for MVP

### Low Priority (v2+)

9. Guards/interceptors/pipes type generation
10. Exception filters for typed error responses
11. SwaggerModule auto-configuration
12. Validation pipe integration

## Implemented Output

### Generated Type Aliases

```typescript
// client/nestjs.gen.ts
import type {
  CreatePetData,
  CreatePetResponse,
  DeletePetData,
  DeletePetResponse,
  ListPetsData,
  ListPetsResponse,
  ShowPetByIdData,
  ShowPetByIdResponse,
  UpdatePetData,
  UpdatePetResponse,
} from './types.gen';

export type PetsControllerMethods = {
  createPet: (body: CreatePetData['body']) => Promise<CreatePetResponse>;
  deletePet: (path: DeletePetData['path']) => Promise<DeletePetResponse>;
  listPets: (query?: ListPetsData['query']) => Promise<ListPetsResponse>;
  showPetById: (path: ShowPetByIdData['path']) => Promise<ShowPetByIdResponse>;
  updatePet: (
    path: UpdatePetData['path'],
    body: UpdatePetData['body'],
  ) => Promise<UpdatePetResponse>;
};

export type StoreControllerMethods = {
  getInventory: () => Promise<GetInventoryResponse>;
};
```

### Usage Pattern

```typescript
// controllers/pets.controller.ts
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import type { PetsControllerMethods } from '../client/nestjs.gen';

@Controller('pets')
export class PetsController implements Pick<
  PetsControllerMethods,
  'listPets' | 'createPet' | 'showPetById'
> {
  @Get()
  async listPets(@Query() query?: ListPetsData['query']) {
    return [];
  }

  @Post()
  async createPet(@Body() body: CreatePetDto) {
    return { id: 1 };
  }

  @Get(':petId')
  async showPetById(@Param() path: ShowPetByIdData['path']) {
    return { id: Number(path.petId), name: 'Kitty' };
  }
}
```

## Example Structure

```
examples/openapi-ts-nestjs/
├── openapi-ts.config.ts      # plugins: ['nestjs', '@hey-api/sdk']
├── openapi.json              # Petstore spec (extended with update/delete)
├── eslint.config.js          # NestJS-specific linting
├── package.json              # @nestjs/core, @nestjs/common, @nestjs/platform-express
├── src/
│   ├── client/
│   │   ├── nestjs.gen.ts     # Generated controller method types
│   │   ├── types.gen.ts      # Shared types (from TypeScript plugin)
│   │   ├── sdk.gen.ts        # Client SDK (from SDK plugin)
│   │   └── index.ts
│   ├── pets/
│   │   ├── pets.controller.ts  # Implements PetsControllerMethods
│   │   └── pets.module.ts
│   ├── store/
│   │   ├── store.controller.ts # Implements StoreControllerMethods
│   │   └── store.module.ts
│   ├── common/
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── app.module.ts         # NestJS module setup
│   └── main.ts               # Bootstrap app
└── test/
    └── pets.test.ts          # Integration tests
```

## Dependencies

### Plugin (dev)

- `@hey-api/typescript` - Base type generation (required dependency)

### Example (runtime)

- `@nestjs/core` (^10.0.0)
- `@nestjs/common` (^10.0.0)
- `@nestjs/platform-express` (^10.0.0) or `@nestjs/platform-fastify`
- `@nestjs/swagger` - OpenAPI documentation
- `class-validator` - DTO request validation
- `class-transformer` - DTO transformation

## Implementation Approach

1. **Plugin structure** at `packages/openapi-ts/src/plugins/nestjs/`:
   - `plugin.ts` (~143 lines) - Core logic
   - `types.ts` (5 lines) - Plugin type definitions
   - `config.ts` (18 lines) - Plugin registration
   - `index.ts` (2 lines) - Re-exports

2. **Type generation** using per-tag grouping:
   - Iterate operations via `plugin.forEach('operation')`
   - Group by first OpenAPI tag (default tag: `'default'`)
   - For each operation: extract params, build method signature
   - Emit per-tag `type` alias: `{PascalTag}ControllerMethods`

3. **Parameter mapping** with required-before-optional sorting:
   - Collect all params (path, query, body, headers)
   - Sort: required params first, optional params last
   - Emit as individual function parameters

4. **Response type mapping**:
   - Use `operationResponsesMap()` to get response info
   - Query `role: 'response'` symbol (union of success bodies, not status-code map)
   - Wrap in `Promise<T>`, fallback to `Promise<void>`

5. **Registration**:
   - Added to `packages/openapi-ts/src/plugins/config.ts`
   - Added to `packages/openapi-ts/src/index.ts` PluginConfigMap

## Deferred Features (v2+)

- Full `@ApiResponse()`, `@ApiOperation()` decorator generation
- `class-validator` decorators in generated DTOs
- Full module generation with `@Module()` decorator
- Service interface generation for DI layer (prototyped and removed)
- Guard/interceptor/pipe type generation
- Exception filter types
- SwaggerModule auto-configuration

## Critical Files Reference

**Plugin implementation:**

- `packages/openapi-ts/src/plugins/nestjs/plugin.ts` - Core logic (143 lines)
- `packages/openapi-ts/src/plugins/nestjs/types.ts` - UserConfig
- `packages/openapi-ts/src/plugins/nestjs/config.ts` - Plugin registration
- `packages/openapi-ts/src/plugins/nestjs/index.ts` - Re-exports

**Studied for implementation:**

- `packages/openapi-ts/src/plugins/fastify/plugin.ts` - Core logic template
- `packages/openapi-ts/src/plugins/fastify/types.ts` - UserConfig pattern
- `packages/openapi-ts/src/plugins/fastify/config.ts` - Plugin registration
- `examples/openapi-ts-fastify/src/handlers.ts` - Handler pattern
- `docs/openapi-ts/plugins/fastify.md` - Docs template
