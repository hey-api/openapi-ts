# @config/vite-base

Base configuration for Vite and Vitest.

## Installation

```bash
pnpm add -D @config/vite-base
```

## Usage

To use the base configuration in your vitest.config.ts:

```ts
// vitest.config.ts
import { createVitestConfig } from '@config/vite-base';

export default createVitestConfig({
  // Your specific configuration
});
```

## Implementation

To complete the implementation of this package in the workspace:

1. Build the package:

   ```bash
   cd packages/configs/vite-base
   pnpm install
   pnpm build
   ```

2. Add it as a dependency to your packages:

   ```bash
   cd <your-package>
   pnpm add -D @config/vite-base@workspace:*
   ```

3. Update your vitest.config.ts and vite.config.ts files to use the base configurations.
