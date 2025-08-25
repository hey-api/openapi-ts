---
title: Hey API Platform
description: Automate your client generation with our OpenAPI specifications storage.
---

# Hey API Platform

::: warning
This feature is in development! :tada: Try it out and provide feedback on [GitHub](https://github.com/orgs/hey-api/discussions/1773).
:::

You can automate your client generation with Hey API Platform thanks to reproducible builds. Create dependency links between your clients and APIs, and watch the magic unfold. It's completely language and codegen agnostic.

## Features

- API version history
- real-time updates
- reproducible builds
- language and codegen agnostic (TypeScript/Python/Go/Java/etc codegens are welcome)

## Upload Specifications

Before you can generate clients, you must publish your OpenAPI specifications to Hey API.

### Prerequisites

1. Create a **free account** with [Hey API](https://app.heyapi.dev).
1. Create a new **organization** and **project** for your API provider. We recommend your naming matches your GitHub structure as it will be referenced by API clients. For example, we are using **hey-api/backend** for the platform.
1. Inside your project, go to _Integrations_ > _APIs_ and generate an **API key**. Keep this value secret, it will be used to upload files.

### Add GitHub CI workflow

Once you have your API key, you can start uploading OpenAPI specifications on every API build. We'll use our [GitHub Action](https://github.com/marketplace/actions/upload-openapi-spec-by-hey-api), but you can also make the API call manually if you're not using GitHub.

Create a new GitHub workflow or add an upload step to an existing workflow inside your API codebase. The example below will upload your OpenAPI specification to Hey API on every pull request and push to the `main` branch.

```yaml
name: Upload OpenAPI Specification

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  upload-openapi-spec:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Upload OpenAPI spec
        uses: hey-api/upload-openapi-spec@v1.3.0
        with:
          path-to-file: path/to/openapi.json
          tags: optional,custom,tags
        env:
          API_KEY: ${{ secrets.HEY_API_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

To successfully upload an OpenAPI specification, you need to provide the following inputs (see `with` in the example above)

#### `path-to-file`

A relative path to your OpenAPI file within the repository. Note that you might need an additional step in your GitHub workflow to generate this file (see [FastAPI example](https://fastapi.tiangolo.com/how-to/extending-openapi/#generate-the-openapi-schema)).

#### `tags` (optional)

A comma-separated string value representing any custom tags you wish to add to your OpenAPI specification.

### Environment Variables

In addition to the required `path-to-file` input, you must provide the following environment variables.

#### `API_KEY`

This is the project API key you obtained from [Hey API](https://app.heyapi.dev).

::: warning
Personal API keys can't be used to upload specifications.
:::

#### `GITHUB_TOKEN`

This variable will be available inside your workflow by default. It's used to
fetch information about your repository, i.e. default branch.

## Generate Clients

You can generate clients from public projects or any private projects you can access. The setup is largely the same, you want to configure the input path used by your codegen.

::: code-group

```sh [Hey API]
npx @hey-api/openapi-ts -i hey-api/backend -o src/client
```

```sh [OpenAPI TypeScript]
npx openapi-typescript \
  https://get.heyapi.dev/hey-api/backend \
  -o schema.ts
```

```sh [Orval]
npx orval \
  --input https://get.heyapi.dev/hey-api/backend \
  --output ./src/client.ts
```

```sh [Other]
other-cli \
  --input https://get.heyapi.dev/hey-api/backend \  # [!code ++]
  --output refer/to/other/tools/docs
```

:::

By default, we preserve the current behavior and return the latest specification. Let's have a closer look at the input path and change that.

## Get API

As you can deduce from the examples above, the default command for fetching OpenAPI specifications looks like this.

```
https://get.heyapi.dev/<organization>/<project>
```

If you created an organization `foo` with project `bar` earlier, your URL would look like this.

```
https://get.heyapi.dev/foo/bar
```

### Auth

Projects are private by default, you will need to be authenticated to download OpenAPI specifications. We recommend using [project API keys](#prerequisites) in CI workflows and [personal API keys](https://app.heyapi.dev/settings/user/apis) for local development.

Once you have your API key, you can authenticate the request using the `Authorization` header or `api_key` query parameter.

```
https://get.heyapi.dev/foo/bar?api_key=<my_api_key>
```

Congratulations on fetching your first OpenAPI specification! 🎉

### Filters

The default behavior returns the last uploaded specification. This might not be what you want. You can use a range of filters to narrow down the possible specifications, or pin your builds to an exact version.

#### `branch`

You can fetch the last build from branch by providing the `branch` query parameter.

```
https://get.heyapi.dev/foo/bar?branch=production
```

#### `commit_sha`

You can fetch an exact specification by providing the `commit_sha` query parameter. This will always return the same file.

```
https://get.heyapi.dev/foo/bar?commit_sha=0eb34c2024841ce95620f3ec02a2fea164ea4e9d
```

#### `tags`

If you're tagging your specifications with [custom tags](#tags-optional), you can use them to filter the results. When you provide multiple tags, only the first match will be returned.

```
https://get.heyapi.dev/foo/bar?tags=optional,custom,tags
```

#### `version`

Every OpenAPI document contains a required version field. You can use this value to fetch the last uploaded specification matching the value.

```
https://get.heyapi.dev/foo/bar?version=1.0.0
```

## Feedback

We'd love your feedback! You can contact us on social media (search Hey API), [email](mailto:lubos@heyapi.dev), or [GitHub](https://github.com/orgs/hey-api/discussions/1773).

## Pricing

The platform is currently in beta with our focus being on delivering a great experience. We plan to announce pricing once we have gathered enough data around usage patterns. However, we can guarantee there will always be a free plan available. Our mission to bring the finest tooling for working with APIs remains unchanged.

<!--@include: ../partials/sponsors.md-->
