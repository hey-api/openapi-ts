---
"@hey-api/openapi-ts": minor
"@hey-api/shared": minor
---

**sdk**: expose `securitySchemes` key on `Auth` when multiple schemes collide

When an OpenAPI spec defines two or more `components.securitySchemes` entries whose generated `Auth` shape would otherwise be identical (for example, two `http`/`bearer` schemes used by different operations), the SDK now emits the `components.securitySchemes` key as `Auth.key`. The runtime `auth` callback can read it to disambiguate which token to return. Schemes with unique signatures are unchanged. Fixes #3817.
