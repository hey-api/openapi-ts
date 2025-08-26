<div align="center">
  <img alt="Hey API logo" height="150" src="https://heyapi.dev/images/logo-300w.png" width="150">
  <h1 align="center"><b>Vite Plugin</b></h1>
  <p align="center">🚀 Vite plugin for <code>@hey-api/openapi-ts</code> codegen.</p>
</div>

## Dashboard

Hey API is an ecosystem of products helping you build better APIs. Superpower your codegen and APIs with Hey API Platform.

[Sign In](https://app.heyapi.dev) to Hey API Platform.

## Contributing

Want to see your code in products used by millions?

Start with our [Contributing](https://heyapi.dev/openapi-ts/community/contributing) guide and release your first feature.

## Documentation

Please visit our [website](https://heyapi.dev) for documentation, guides, migrating, and more.

## Sponsors

Help Hey API stay around for the long haul by becoming a [sponsor](https://github.com/sponsors/hey-api).

<h3 align="center">Gold</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tbody>
    <tr>
      <td align="center">
        <p></p>
        <p>
          <a href="https://kutt.it/pkEZyc" target="_blank">
            <picture height="50px">
              <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/images/stainless-logo-wordmark-480w.jpeg">
              <img alt="Stainless logo" height="50px" src="https://heyapi.dev/images/stainless-logo-wordmark-480w.jpeg">
            </picture>
          </a>
          <br/>
          Best-in-class SDKs and MCP for your API.
          <br/>
          <a href="https://kutt.it/pkEZyc" style="text-decoration:none;" target="_blank">
            stainless.com
          </a>
        </p>
        <p></p>
      </td>
    </tr>
  </tbody>
</table>

<h3 align="center">Silver</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tbody>
    <tr>
      <td align="center">
        <a href="https://kutt.it/skQUVd" target="_blank">
          <picture height="40px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/images/scalar-logo-wordmark-480w.jpeg">
            <img alt="Scalar logo" height="40px" src="https://heyapi.dev/scalar-logo-wordmark.svg">
          </picture>
        </a>
        <br/>
        <a href="https://kutt.it/skQUVd" style="text-decoration:none;" target="_blank">
          scalar.com
        </a>
      </td>
      <td align="center">
        <a href="https://kutt.it/Dr9GuW" target="_blank">
          <picture height="40px">
            <img alt="FastAPI logo" height="40px" src="https://heyapi.dev/fastapi-logo-wordmark.svg">
          </picture>
        </a>
        <br/>
        <a href="https://kutt.it/Dr9GuW" style="text-decoration:none;" target="_blank">
          fastapi.tiangolo.com
        </a>
      </td>
    </tr>
  </tbody>
</table>

<h3 align="center">Bronze</h3>

<table align="center" style="justify-content: center;align-items: center;display: flex;">
  <tbody>
    <tr>
      <td align="center">
        <a href="https://kutt.it/YpaKsX" target="_blank">
          <picture height="34px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/images/kinde-logo-wordmark-dark-480w.webp">
            <img alt="Kinde logo" height="34px" src="https://heyapi.dev/images/kinde-logo-wordmark-480w.jpeg">
          </picture>
        </a>
      </td>
      <td align="center">
        <a href="https://kutt.it/KkqSaw" target="_blank">
          <picture height="34px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/images/cella-logo-wordmark-480w.webp">
            <img alt="Cella logo" height="34px" src="https://heyapi.dev/cella-logo-wordmark.svg">
          </picture>
        </a>
      </td>
    </tr>
  </tbody>
</table>

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
