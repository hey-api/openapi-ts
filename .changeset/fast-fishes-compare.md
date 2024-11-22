---
'@hey-api/openapi-ts': minor
---

feat: rename Hey API plugins

### Renamed `@hey-api/services` plugin

This plugin has been renamed to `@hey-api/sdk`.

### Changed `sdk.output` value

To align with the updated name, the `@hey-api/sdk` plugin will generate an `sdk.gen.ts` file. This will result in a breaking change if you're importing from `services.gen.ts`. Please update your imports to reflect this change.

```js
import { client } from 'client/services.gen'; // [!code --]
import { client } from 'client/sdk.gen'; // [!code ++]
```

### Renamed `@hey-api/types` plugin

This plugin has been renamed to `@hey-api/typescript`.
