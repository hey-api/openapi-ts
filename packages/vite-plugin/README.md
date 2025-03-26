<div align="center">
  <img alt="Hey API logo" height="150" src="https://heyapi.dev/images/logo-300w.png" width="150">
  <h1 align="center"><b>Vite Plugin</b></h1>
  <p align="center">🚀 Vite plugin for `@hey-api/openapi-ts` codegen.</p>
</div>

## Platform

Our platform for OpenAPI specifications is now available. Automatically update your code when the APIs it depends on change. [Find out more](https://heyapi.dev/openapi-ts/integrations).

## Documentation

Please visit our [website](https://heyapi.dev/) for documentation, guides, migrating, and more.

## Sponsors

Love Hey API? Become our [sponsor](https://github.com/sponsors/hey-api).

<p>
  <a href="https://kutt.it/pkEZyc" target="_blank">
    <img alt="Stainless logo" height="50" src="https://heyapi.dev/images/stainless-logo-wordmark-480w.jpeg" />
  </a>
</p>

## Usage

Add to `plugins` inside your Vite configuration.

```ts
import { heyApiPlugin } from '@hey-api/vite-plugin';

export default defineConfig({
  plugins: [
    heyApiPlugin({
      config: {
        // optional configuration instead of using the configuration file
      },
    }),
  ],
});
```
