---
"@hey-api/openapi-ts": patch
---

Fix Zod schema union deduplication by including validation constraints in type ID

The Zod plugin was incorrectly deduplicating schemas with different validation constraints when using `anyOf`, resulting in incomplete union schemas. This fix ensures that schemas with different validation constraints (like `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, etc.) are properly preserved in unions.

For example, with an `anyOf` containing strings with different length constraints:
- Before: `z.string().length(5)` (incorrect - only one constraint)
- After: `z.union([z.string().length(5), z.string().length(2)])` (correct - proper union)

Fixes issue where the `deduplicateSchema` function was only considering `$ref`, `type`, `const`, and `format` when creating type identifiers, but ignored validation constraints.