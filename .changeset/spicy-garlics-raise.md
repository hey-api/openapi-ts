---
'@hey-api/codegen-core': minor
---

**BREAKING**: Drop CommonJS (CJS) support. This package is now **ESM-only**.

### Removed CommonJS (CJS) support

`@hey-api/codegen-core` is now ESM-only. This change simplifies the codebase, improves tree-shaking, and enables better integration with modern bundlers and TypeScript tooling.

CommonJS entry points (`require()`, `module.exports`) are no longer supported. If you are in a CJS environment, you can still load the package dynamically using `import()` like:

```js
const { Project } = await import('@hey-api/codegen-core');
```

If you have previously written:

```js
const { Project } = require('@hey-api/codegen-core');
```

Migrate by updating your static imports:

```js
import { Project } from '@hey-api/codegen-core';
```

If your environment cannot use ESM, pin to a previous version.
