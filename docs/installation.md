---
title: Installation
description: Installing @hey-api/openapi-ts.
---

# Installation

```sh
npm install @hey-api/openapi-ts --save-dev
```

or

```sh
yarn add @hey-api/openapi-ts -D
```

or

```sh
pnpm add @hey-api/openapi-ts -D
```

If you want to use `openapi-ts` with CLI, add a script to your `package.json` file

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

You can also generate your client programmatically by importing `openapi-ts` in a `.ts` file.

```ts
import { createClient } from '@hey-api/openapi-ts'

createClient({
  input: 'path/to/openapi.json',
  output: 'src/client',
})
```

::: warning
You need to be running Node.js v18 or newer
:::
