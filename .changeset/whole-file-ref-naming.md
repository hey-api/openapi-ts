---
"@hey-api/json-schema-ref-parser": patch
---

**bundle**: name whole-file `$ref`s after the source filename instead of the placeholder `root`. Previously, refs like `$ref: './AgentType.yml'` produced schemas named `root`, `<Filename>_root`, etc. They are now named after the source file (`AgentType`, `UserType`, …).
