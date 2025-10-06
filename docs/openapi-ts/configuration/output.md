---
title: Output
description: Configure @hey-api/openapi-ts.
---

# Output

You must set the output so we know where to generate your files.

## Output

Output can be a path to the destination folder or an object containing the destination folder path and optional settings.

::: code-group

```js [path]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client', // [!code ++]
};
```

<!-- prettier-ignore-start -->
```js [object]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: { // [!code ++]
    path: 'src/client', // [!code ++]
    // ...other options // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

You can learn more about complex use cases in the [Advanced](/openapi-ts/configuration#advanced) section.

## File Name

You can customize the naming and casing pattern for files using the `fileName` option.

::: code-group

```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: '{{name}}', // [!code ++]
    path: 'src/client',
  },
};
```

```js [snake_case]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: {
      case: 'snake_case', // [!code ++]
    },
    path: 'src/client',
  },
};
```

:::

By default, we append every file name with a `.gen` suffix to highlight it's automatically generated. You can customize or disable this suffix using the `fileName.suffix` option.

::: code-group

```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: {
      suffix: '.gen', // [!code ++]
    },
    path: 'src/client',
  },
};
```

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: {
      suffix: null, // [!code ++]
    },
    path: 'src/client',
  },
};
```

```js [custom]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: {
      suffix: '.generated', // [!code ++]
    },
    path: 'src/client',
  },
};
```

:::

## Import File Extension

You can customize the extension used for imported TypeScript files.

::: code-group

```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    importFileExtension: undefined, // [!code ++]
    path: 'src/client',
  },
};
```

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    importFileExtension: null, // [!code ++]
    path: 'src/client',
  },
};
```

```js [js]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    importFileExtension: '.js', // [!code ++]
    path: 'src/client',
  },
};
```

```js [ts]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    importFileExtension: '.ts', // [!code ++]
    path: 'src/client',
  },
};
```

:::

By default, we don't add a file extension and let the runtime resolve it.

```js
import foo from './foo';
```

If we detect a [TSConfig file](#tsconfig-path) with `moduleResolution` option set to `nodenext`, we default the extension to `.js`.

```js
import foo from './foo.js';
```

## Format

To format your output folder contents, set `format` to a valid formatter.

::: code-group

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: null, // [!code ++]
    path: 'src/client',
  },
};
```

```js [prettier]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being formatted by adding your output path to the formatter's ignore file.

## Lint

To lint your output folder contents, set `lint` to a valid linter.

::: code-group

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    lint: null, // [!code ++]
    path: 'src/client',
  },
};
```

```js [eslint]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    lint: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

```js [oxlint]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    lint: 'oxlint', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## TSConfig Path

We use the [TSConfig file](https://www.typescriptlang.org/tsconfig/) to generate output matching your project's settings. By default, we attempt to find a TSConfig file starting from the location of the `@hey-api/openapi-ts` configuration file and traversing up.

::: code-group

```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    tsConfigPath: undefined, // [!code ++]
  },
};
```

```js [custom]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    tsConfigPath: './config/tsconfig.custom.json', // [!code ++]
  },
};
```

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    tsConfigPath: null, // [!code ++]
  },
};
```

:::

## Custom Files

By default, you can't keep custom files in the `path` folder because it's emptied on every run. If you're sure you need to disable this behavior, set `clean` to `false`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    clean: false, // [!code ++]
    path: 'src/client',
  },
};
```

::: warning
Setting `clean` to `false` may result in broken output. Ensure you typecheck your code.
:::

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
