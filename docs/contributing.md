---
title: Contributing
description: Learn how to contribute to Hey API.
---

# Contributing

Thank you for considering contributing to Hey API.

## Development Requirements

- [git](https://git-scm.com/)
- [node](https://nodejs.org/en) (version `18.0` or higher)
- [pnpm](https://pnpm.io/) (version `8` or higher)

## Install Dependencies

We use pnpm as our package manager. You can setup and install all dependencies running the following command:

```sh
pnpm install
```

## Pull Request Guidelines

If you are unfamiliar with GitHub Pull Requests, please read the following documentation:
https://help.github.com/articles/using-pull-requests

**Your Pull Request must:**

-   Address a single issue or add a single item of functionality.
-   Contain a clean history of small, incremental, logically separate commits, with no merge commits.
-   Use clear commit messages.
-   Be possible to merge automatically.

## Submitting a Pull Request

1. Make your changes in a new git branch: `git checkout -b my-fix-branch main`
1. Create your patch or feature
1. Ensure the builds work by running: `pnpm build`
1. Ensure the tests will pass by running: `pnpm test`
1. Ensure the code is formatted by running: `pnpm lint:fix`
1. Ensure that you create a changeset if required by running: `pnpm changeset`
1. Commit your changes using a descriptive commit message

After your Pull Request is created, it will automatically be built and tested in GitHub actions. Once successful, it will be ready for review.
