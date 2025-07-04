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
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client', // [!code ++]
};
```

<!-- prettier-ignore-start -->
```js [object]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: { // [!code ++]
    path: 'src/client', // [!code ++]
    // ...other options // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

## Format

To format your output folder contents, set `output.format` to a valid formatter.

::: code-group

```js [disabled]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [prettier]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being formatted by adding your output path to the formatter's ignore file.

## Lint

To lint your output folder contents, set `output.lint` to a valid linter.

::: code-group

```js [disabled]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [eslint]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

```js [oxlint]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'oxlint', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## TSConfig Path

We use the [TSConfig file](https://www.typescriptlang.org/tsconfig/) to generate output matching your project's settings. By default, we attempt to find a TSConfig file starting from the location of the `@hey-api/openapi-ts` configuration file and traversing up. If your file is located in a different place or you want to disable this setting, set `output.tsConfigPath` to a string.

::: code-group

```js [custom]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    path: 'src/client',
    tsConfigPath: './config/tsconfig.custom.json', // [!code ++]
  },
};
```

```js [off]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    path: 'src/client',
    tsConfigPath: 'off', // [!code ++]
  },
};
```

:::

## Custom Files

By default, you can't keep custom files in the `output.path` folder because it's emptied on every run. If you're sure you need to disable this behavior, set `output.clean` to `false`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    clean: false, // [!code ++]
    path: 'src/client',
  },
};
```

::: warning
Setting `output.clean` to `false` may result in broken output. Ensure you typecheck your code.
:::

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
