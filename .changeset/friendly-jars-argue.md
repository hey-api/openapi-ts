---
'@hey-api/openapi-ts': patch
---

fix: sdks import client from client.gen.ts instead of defining it inside the file

### Added `client.gen.ts` file

The internal `client` instance previously located in `sdk.gen.ts` is now defined in `client.gen.ts`. If you're importing it in your code, update the import module.

```js
import { client } from 'client/sdk.gen'; // [!code --]
import { client } from 'client/client.gen'; // [!code ++]
```
