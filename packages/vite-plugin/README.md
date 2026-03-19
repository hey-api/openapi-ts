<div align="center">
  <img alt="Hey API logo" height="150" src="https://heyapi.dev/assets/.gen/logo-astronaut-300w.png" width="150">
  <h1 align="center"><b>Vite Plugin</b></h1>
  <p align="center">🚀 Vite plugin for <code>@hey-api/openapi-ts</code> codegen.</p>
</div>

## Dashboard

Access your projects and OpenAPI specifications in the [Hey API Platform](https://app.heyapi.dev/).

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
      <td align="center" width="336px">
        <p></p>
        <p>
          <a href="https://kutt.to/pkEZyc" target="_blank">
            <picture height="50px">
              <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/.gen/stainless-logo-wordmark-480w.jpeg">
              <img alt="Stainless logo" height="50px" src="https://heyapi.dev/assets/.gen/stainless-logo-wordmark-480w.jpeg">
            </picture>
          </a>
          <br/>
          Best-in-class developer interfaces for your API.
          <br/>
          <a href="https://kutt.to/pkEZyc" style="text-decoration:none;" target="_blank">
            stainless.com
          </a>
        </p>
        <p></p>
      </td>
      <td align="center" width="336px">
        <p></p>
        <p>
          <a href="https://kutt.to/QM9Q2N" target="_blank">
            <picture height="50px">
              <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/opencode/logo-light.svg">
              <img alt="Opencode logo" height="50px" src="https://heyapi.dev/assets/opencode/logo-dark.svg">
            </picture>
          </a>
          <br/>
          The open source coding agent.
          <br/>
          <a href="https://kutt.to/QM9Q2N" style="text-decoration:none;" target="_blank">
            opencode.ai
          </a>
        </p>
        <p></p>
      </td>
    </tr>
    <tr>
      <td align="center" width="336px">
        <p></p>
        <p>
          <a href="https://kutt.to/6vrYy9" target="_blank">
            <picture height="50px">
              <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/mintlify/logo-light.svg">
              <img alt="Mintlify logo" height="50px" src="https://heyapi.dev/assets/mintlify/logo-dark.svg">
            </picture>
          </a>
          <br/>
          The intelligent knowledge platform.
          <br/>
          <a href="https://kutt.to/6vrYy9" style="text-decoration:none;" target="_blank">
            mintlify.com
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
      <td align="center" width="172px">
        <a href="https://kutt.to/skQUVd" target="_blank">
          <picture height="40px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/scalar/logo-light.svg">
            <img alt="Scalar logo" height="40px" src="https://heyapi.dev/assets/scalar/logo-dark.svg">
          </picture>
        </a>
        <br/>
        <a href="https://kutt.to/skQUVd" style="text-decoration:none;" target="_blank">
          scalar.com
        </a>
      </td>
      <td align="center" width="172px">
        <a href="https://kutt.to/Dr9GuW" target="_blank">
          <picture height="40px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/fastapi/logo-light.svg">
            <img alt="FastAPI logo" height="40px" src="https://heyapi.dev/assets/fastapi/logo-dark.svg">
          </picture>
        </a>
        <br/>
        <a href="https://kutt.to/Dr9GuW" style="text-decoration:none;" target="_blank">
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
      <td align="center" width="136px">
        <a href="https://kutt.to/YpaKsX" target="_blank">
          <picture height="34px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/.gen/kinde-logo-wordmark-dark-480w.webp">
            <img alt="Kinde logo" height="34px" src="https://heyapi.dev/assets/.gen/kinde-logo-wordmark-480w.jpeg">
          </picture>
        </a>
      </td>
      <td align="center" width="136px">
        <a href="https://kutt.to/KkqSaw" target="_blank">
          <picture height="34px">
            <source media="(prefers-color-scheme: dark)" srcset="https://heyapi.dev/assets/cella/logo-light.svg">
            <img alt="Cella logo" height="34px" src="https://heyapi.dev/assets/cella/logo-dark.svg">
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
