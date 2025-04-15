---
'@hey-api/openapi-ts': patch
---

Issue when using Content-Type': 'application/octet-stream', it using default json serializer. The fix is adding new media type octet-stream and body serializer to null when using Content-Type': 'application/octet-stream'
