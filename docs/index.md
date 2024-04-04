---
layout: home

hero:
  name: OpenAPI TypeScript
  tagline: Turn your OpenAPI specification into a beautiful TypeScript client
  actions:
    - theme: brand
      text: Get Started
      link: /get-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/hey-api/openapi-ts
  image:
    src: /logo.png
    alt: logo

features:
  - icon: ✍️
    title: OpenAPI Schema
    details: You provide your OpenAPI specification. We take care of the rest. OpenAPI v2.0, v3.0, and v3.1 supported.
  - icon: 🤖
    title: TypeScript Interfaces
    details: Generate types for your API data. Ensure code correctness. No manual maintenance required.
  - icon: 🦴
    title: Data Fetching
    details: Let us fetch that for you. We support fetch, axios, angular, and even node or xhr clients.
---

<style>
:root {
  --c-gradient-start: #91d6d5;
  --vp-c-brand-1: #225e72;
  --vp-c-brand-2: #55979e;
  --vp-c-brand-3: #67abac;
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, var(--vp-c-brand-3) 30%, var(--c-gradient-start));

  --vp-home-hero-image-background-image: linear-gradient(-45deg, var(--vp-c-brand-3) 50%, var(--c-gradient-start) 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
