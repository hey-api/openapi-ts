---
'@hey-api/openapi-ts': patch
---

fix: update schemas plugin to handle experimental 3.0.x parser

This release adds an experimental parser for OpenAPI versions 3.0.x. In the future, this will become the default parser. If you're using OpenAPI 3.0 or newer, we encourage you to try it out today.

You can enable the experimental parser by setting the `experimentalParser` boolean flag to `true` in your configuration file or CLI.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  experimentalParser: true,
};
```

```sh
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch -e
```

The generated output should not structurally change, despite few things being generated in a different order. In fact, the output should be cleaner! That's the immediate side effect you should notice. If that's not true, please leave feedback in [GitHub issues](https://github.com/hey-api/openapi-ts/issues).

Hey API parser marks an important milestone towards v1 of `@hey-api/openapi-ts`. More features will be added to the parser in the future and the original parser from `openapi-typescript-codegen` will be deprecated and used only for generating legacy clients.

If you'd like to work with the parser more closely (e.g. to generate code not natively supported by this package), feel free to reach out with any feedback or suggestions. Happy parsing! 🎉
