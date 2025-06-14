---
'@hey-api/openapi-ts': minor
---

feat: bundle `@hey-api/client-*` plugins

### Bundle `@hey-api/client-*` plugins

In previous releases, you had to install a separate client package to generate a fully working output, e.g. `npm install @hey-api/client-fetch`. This created a few challenges: getting started was slower, upgrading was sometimes painful, and bundling too. Beginning with v0.73.0, all Hey API clients are bundled by default and don't require installing any additional dependencies. You can remove any installed client packages and re-run `@hey-api/openapi-ts`.

```sh
npm uninstall @hey-api/client-fetch
```
