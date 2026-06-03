---
"@hey-api/openapi-ts": patch
---

The fix reassigns the result of HttpHeaders.delete() back to opts.headers. Angular's HttpHeaders is immutable — .delete() returns a new instance rather than mutating in place — so without the assignment, the Content-Type header was never actually removed on bodyless requests.
