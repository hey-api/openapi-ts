---
'@hey-api/client-axios': minor
---

**BREAKING**: please update `@hey-api/openapi-ts` to the latest version

feat: replace accessToken and apiKey functions with auth

### Added `auth` option

Client package functions `accessToken` and `apiKey` were replaced with a single `auth` function for fetching auth tokens. If your API supports multiple auth mechanisms, you can use the `auth` argument to return the appropriate token.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  accessToken: () => '<my_token>', // [!code --]
  apiKey: () => '<my_token>', // [!code --]
  auth: (auth) => '<my_token>', // [!code ++]
});
```

Due to conflict with the Axios native `auth` option, we removed support for configuring Axios auth. Please let us know if you require this feature added back.
