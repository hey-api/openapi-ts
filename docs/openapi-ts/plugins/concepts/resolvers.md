---
title: Resolvers
description: Understand the concepts behind plugins.
---

# Resolvers

Sometimes the default plugin behavior isn't what you need or expect. Resolvers let you patch plugins in a safe and performant way, without forking or reimplementing core logic.

Currently available for [Valibot](/openapi-ts/plugins/valibot) and [Zod](/openapi-ts/plugins/zod).

## Examples

This page demonstrates resolvers through a few common scenarios.

1. [Handle arbitrary schema formats](#example-1)
2. [Validate high precision numbers](#example-2)
3. [Replace default base](#example-3)
4. [Create permissive enums](#example-4)

## Terminology

Before we look at examples, let's go through the resolvers API to help you understand how they work. Plugins that support resolvers expose them through the `~resolvers` option. Each resolver is a function that receives context and returns an implemented node (or patches existing ones).

The resolver context will usually contain:

- `$` - The node builder interface. Use it to build your custom logic.
- `nodes` - Parts of the plugin logic. You can use these to avoid reimplementing the functionality, or replace them with custom implementation.
- `plugin` - The plugin instance. You'll most likely use it to register new symbols.
- `symbols` - Frequently used symbols. These are effectively shorthands for commonly used `plugin.referenceSymbol()` calls.

Other fields may include the current schema or relevant utilities.

## Example 1

### Handle arbitrary schema formats

By default, the Valibot plugin may produce the following schemas for `date` and `date-time` strings.

```js
export const vDates = v.object({
  created: v.pipe(v.string(), v.isoDate()),
  modified: v.pipe(v.string(), v.isoTimestamp()),
});
```

We can override this behavior by patching the `nodes.format` function only for strings with `date` or `date-time` formats.

```js
{
  name: 'valibot',
  '~resolvers': {
    string(ctx) {
      const { $, schema, symbols } = ctx;
      const { v } = symbols;
      if (schema.format === 'date' || schema.format === 'date-time') {
        ctx.nodes.format = () => $(v).attr('isoDateTime').call();
      }
    }
  }
}
```

This applies custom logic with surgical precision, without affecting the rest of the default behavior.

::: code-group

```js [after]
export const vDates = v.object({
  created: v.pipe(v.string(), v.isoDateTime()),
  modified: v.pipe(v.string(), v.isoDateTime()),
});
```

```js [before]
export const vDates = v.object({
  created: v.pipe(v.string(), v.isoDate()),
  modified: v.pipe(v.string(), v.isoTimestamp()),
});
```

:::

## Example 2

### Validate high precision numbers

Let's say you're dealing with very large or unsafe numbers.

```js
export const vAmount = v.number();
```

In this case, you'll want to use a third-party library to validate your values. We can use big.js to validate all numbers by replacing the whole resolver.

```js
{
  name: 'valibot',
  '~resolvers': {
    number(ctx) {
      const { $, plugin, symbols } = ctx;
      const { v } = symbols;
      const big = plugin.symbolOnce('Big', {
        external: 'big.js',
        importKind: 'default',
      });
      return $(v).attr('instance').call(big);
    }
  }
}
```

We're calling `plugin.symbolOnce()` to ensure we always use the same symbol reference.

::: code-group

```js [after]
import Big from 'big.js';

export const vAmount = v.instance(Big);
```

```js [before]
export const vAmount = v.number();
```

:::

## Example 3

### Replace default base

You might want to replace the default base schema, e.g. `v.object()`.

```js
export const vUser = v.object({
  age: v.number(),
});
```

Let's say we want to interpret any schema without explicitly defined additional properties as a loose object.

```js
{
  name: 'valibot',
  '~resolvers': {
    object(ctx) {
      const { $, symbols } = ctx;
      const { v } = symbols;
      const additional = ctx.nodes.additionalProperties(ctx);
      if (additional === undefined) {
        const shape = ctx.nodes.shape(ctx);
        ctx.nodes.base = () => $(v).attr('looseObject').call(shape);
      }
    }
  }
}
```

Above we demonstrate patching a node based on the result of another node.

::: code-group

```js [after]
export const vUser = v.looseObject({
  age: v.number(),
});
```

```js [before]
export const vUser = v.object({
  age: v.number(),
});
```

:::

## Example 4

### Create permissive enums

By default, enum schemas are strict and will reject unknown values.

```js
export const zStatus = z.enum(['active', 'inactive', 'pending']);
```

You might want to accept unknown enum values, for example when the API adds new values that haven't been added to the spec yet. You can use the enum resolver to create a permissive union.

```js
{
  name: 'zod',
  '~resolvers': {
    enum(ctx) {
      const { $, symbols } = ctx;
      const { z } = symbols;
      const { allStrings, enumMembers, literalMembers } = ctx.nodes.items(ctx);

      if (!allStrings || !enumMembers.length) {
        return;
      }

      const enumSchema = $(z).attr('enum').call($.array(...enumMembers));
      return $(z).attr('union').call(
        $.array(enumSchema, $(z).attr('string').call())
      );
    }
  }
}
```

This resolver creates a union that accepts both the known enum values and any other string.

::: code-group

```js [after]
export const zStatus = z.union([z.enum(['active', 'inactive', 'pending']), z.string()]);
```

```js [before]
export const zStatus = z.enum(['active', 'inactive', 'pending']);
```

:::

## Feedback

We welcome feedback on the Resolvers API. [Open a GitHub issue](https://github.com/hey-api/openapi-ts/issues) to request support for additional plugins.

<!--@include: ../../../partials/sponsors.md-->
