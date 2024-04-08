---
layout: home

hero:
  name: High-quality tools for interacting with APIs
  tagline: Abstractions for your TypeScript code. Automate type generation and typesafe data fetching.
  actions:
    - theme: brand
      text: Get Started
      link: /welcome
    - theme: alt
      text: View on GitHub
      link: https://github.com/hey-api/openapi-ts
  image:
    src: /logo.png
    alt: logo

features:
  - icon: ✍️
    title: OpenAPI Schema
    details: You provide OpenAPI specification. We take care of the rest. OpenAPI v2.0, v3.0, and v3.1 supported.
  - icon: 🤖
    title: TypeScript Interfaces
    details: Ensure code correctness without runtime overhead. No manual maintenance required.
  - icon: 🦴
    title: Data Fetching
    details: Typesafe data with our REST clients. Fetch, axios, angular, node, and xhr are available.
  - icon: "{✓}"
    title: JSON Schemas
    details: Export OpenAPI schemas as JavaScript objects. JSON Schema 2020-12 supported.
---

### Migrating from OpenAPI Typescript Codegen?

Please read our [migration guide](/openapi-ts/migrating#openapi-typescript-codegen).

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, var(--c-gradient-start) 30%, var(--vp-c-brand-3));
}

html.dark {
  --vp-home-hero-image-background-image: linear-gradient(-45deg, var(--vp-c-brand-3) 50%, var(--c-gradient-start) 50%);
  --vp-home-hero-image-filter: blur(144px);
}

@media (min-width: 640px) {
  html.dark {
    --vp-home-hero-image-filter: blur(156px);
  }
}

@media (min-width: 960px) {
  html.dark {
    --vp-home-hero-image-filter: blur(168px);
  }
}
</style>
