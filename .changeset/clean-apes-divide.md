---
'@hey-api/openapi-ts': patch
---

**output**: add `nameConflictResolver` option

## Name Conflicts

As your project grows, the chances of name conflicts increase. We use a simple conflict resolver that appends numeric suffixes to duplicate identifiers. If you prefer a different strategy, you can provide your own `nameConflictResolver` function.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    nameConflictResolver({ attempt, baseName }) {
      return attempt === 0 ? baseName : `${baseName}_N${attempt + 1}`;
    },
    path: 'src/client',
  },
};
```

Example output:

```ts
export type ChatCompletion = string;

export type ChatCompletion_N2 = number;
```
