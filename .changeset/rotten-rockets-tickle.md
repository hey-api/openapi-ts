---
'@hey-api/openapi-ts': minor
---

fix: remove schemas and transformers re-exports from index.ts

### Removed `schemas.gen.ts` re-export

`index.ts` will no longer re-export `schemas.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `schemas.gen.ts` directly.

```js
import { mySchema } from 'client'; // [!code --]
import { mySchema } from 'client/schemas.gen'; // [!code ++]
```

### Removed `transformers.gen.ts` re-export

`index.ts` will no longer re-export `transformers.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `transformers.gen.ts` directly.

```js
import { myTransformer } from 'client'; // [!code --]
import { myTransformer } from 'client/transformers.gen'; // [!code ++]
```
