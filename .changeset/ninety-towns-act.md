---
"@hey-api/openapi-ts": minor
---

**plugin(zod)**: remove `enum.nodes.nullable` resolver node

### Removed resolver node

Zod plugin no longer exposes the `enum.nodes.nullable` node. It was refactored so that nullable values are handled outside of resolvers.
