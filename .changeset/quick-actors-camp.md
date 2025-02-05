---
'@hey-api/client-axios': patch
'@hey-api/client-core': patch
'@hey-api/client-fetch': patch
'@hey-api/client-next': patch
'@hey-api/client-nuxt': patch
---

Return a string from urlSearchParamsBodySerializer instead of a URLSearchParams object.
This is due to some runtimes not being able to handle the URLSearchParams object as fetch body.
