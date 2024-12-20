---
title: Integrations
description: Automate your client generation.
---

# Integrations <span data-soon>Soon</span>

::: warning
GitHub integration is not publicly available yet. We are gathering feedback from beta testers to ensure the final product meets our quality standards. To express your interest in joining the beta test, please open an issue on [GitHub](https://github.com/hey-api/upload-openapi-spec/issues).
:::

Integrations allow you to automate your client generation workflow. Create dependency links between your clients and APIs, and watch the magic unfold. While we prefer to use `@hey-api/openapi-ts` for generating clients, you can use any codegen.

## Upload OpenAPI Spec

First, you need to configure your API build workflow to send us OpenAPI specifications. This can be done by adding our [hey-api/upload-openapi-spec](https://github.com/marketplace/actions/upload-openapi-spec-by-hey-api) GitHub Action into your CI workflow.

```yaml
name: Upload OpenAPI Specification

on:
  push:
    branches:
      - main

jobs:
  upload-openapi-spec:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Upload OpenAPI spec
        uses: hey-api/upload-openapi-spec@v1
        with:
          hey-api-token: ${{ secrets.HEY_API_TOKEN }}
          path-to-openapi: path/to/openapi.json
```

This step requires you to register with us in order to obtain a Hey API token. Please follow the instructions in our [GitHub Action](https://github.com/marketplace/actions/upload-openapi-spec-by-hey-api) to complete the setup. Once you have your APIs configured, you're ready to connect your clients.

## Configure Clients

More information will be provided as we finalize the tooling.
