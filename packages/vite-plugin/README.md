<div align="center">
  <img alt="Hey API logo" height="150" src="https://heyapi.dev/images/logo-300w.png" width="150">
  <h1 align="center"><b>Vite Plugin</b></h1>
  <p align="center">🚀 Vite plugin for `@hey-api/openapi-ts` codegen.</p>
</div>

## Dashboard

Hey API is an ecosystem of products helping you build better APIs. Superpower your codegen and APIs with our platform.

[Sign In](https://app.heyapi.dev) to Hey API platform.

## Documentation

Please visit our [website](https://heyapi.dev) for documentation, guides, migrating, and more.

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
