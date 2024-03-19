# Contributing to OpenAPI TypeScript Codegen

Thanks for your interest in contributing to this project.

## Development Requirements

-   [git](https://git-scm.com/)
-   [node](https://nodejs.org/en) (version `18.0` or higher)

## Setting up for Development

For this project we use NPM as our package manager. You can setup and install all dependencies running the following commands:

```sh
# Enable corepack, it is disabled by default in the supported versions of NodeJS
corepack enable
# Prepare corepack based on the packageManager specified in the projects package.json
corepack prepare
# Install all dependencies
npm install
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

1. Make your changes in a new git branch: `git checkout -b my-fix-branch master`
2. Create your patch or feature
3. Ensure the builds work by running: `npm run build`
4. Ensure the tests will pass by running: `npm run test`
5. Ensure the code is formatted by running: `npm run eslint:fix`
6. Commit your changes using a descriptive commit message

After your Pull Request is created, it will automatically be build and tested in GitHub actions. Once successful it will be ready for review.
