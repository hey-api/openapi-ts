---
'@hey-api/openapi-ts': minor
---

**BREAKING**: Drop CommonJS (CJS) support. This package is now **ESM-only**.

### Removed CommonJS (CJS) support

`@hey-api/openapi-ts` is now ESM-only. This change simplifies the codebase, improves tree-shaking, and enables better integration with modern bundlers and TypeScript tooling.

CommonJS entry points (`require()`, `module.exports`) are no longer supported. If you are in a CJS environment, you can still load the package dynamically using `import()` like:

```js
const { defineConfig } = await import('@hey-api/openapi-ts');
```

If you have previously written:

```js
const { defineConfig } = require('@hey-api/openapi-ts');
```

Migrate by updating your static imports:

```js
import { defineConfig } from '@hey-api/openapi-ts';
```

If your environment cannot use ESM, pin to a previous version.
