# Contributing to Webpack Typings for JSON

Thanks for your interest in contributing to this project.

## Pull Request guidelines

Before working on a Pull Request, create an issue explaining what you want to contribute.
This ensures that your pull request won't go unnoticed, and that you are not contributing
something that is not suitable for the project.

If you are unfamiliar with GitHub Pull Requests, please read the following documentation:
https://help.github.com/articles/using-pull-requests

**Your Pull Request must:**

* Address a single issue or add a single item of functionality.
* Contain a clean history of small, incremental, logically separate commits, with no merge commits.
* Use clear commit messages.
* Be possible to merge automatically.

## Submitting a Pull Request

1. Make your changes in a new git branch: `git checkout -b my-fix-branch master`
2. Create your patch or feature
3. Ensure the builds work by running: `npm run build`
4. Ensure the tests will pass by running: `npm run test`
5. Ensure the code is formatted by running: `npm run eslint:fix`
6. Commit your changes using a descriptive commit message

After your Pull Request is created, it will automatically be build using Circle CI.
When the build is successful then the Pull Request is ready for review.
