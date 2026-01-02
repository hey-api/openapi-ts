---
'@hey-api/openapi-ts': minor
---

**plugin(sdk)**: **BREAKING**: Structure API

### Structure API

The [SDK plugin](https://heyapi.dev/openapi-ts/plugins/sdk) now implements the Structure API, enabling more complex structures and fixing several known issues.

Some Structure APIs are incompatible with the previous configuration, most notably the `methodNameBuilder` function, which accepted the operation object as an argument. You can read the [SDK Output](https://heyapi.dev/openapi-ts/plugins/sdk#output) section to familiarize yourself with the Structure API.

Please [open an issue](https://github.com/hey-api/openapi-ts/issues) if you're unable to migrate your configuration to the new syntax.
