# Contributing to this Repository

Thanks for considering a contribution to this repo!

You can contribute in a number of ways:

- Reporting bugs

- Suggesting enhancements

- Making code contributions

## Reporting bugs

If something isn't working how you expect it to, it might be a bug in the code. Please create an
issue to let us know, and tag it with the `bug` tag.

When filing a bug, please explain:

- What behaviour you observed and what you expected to observe.

- Steps to reproduce the error, if possible (or a link to the workflow where the problematic
  behavior can be observed).

## Proposing enhancements

If you have a good idea for something that you'd like to see,  we'd love to hear about it. Please
create an issue and tag it:

- Use the `enhancement` tag if it's a new feature.

- Use the `documentation` tag if it relates to the docs.

## Code contributions

### Building and testing locally

First, you'll need to have a reasonably modern version of `node` handy. The actions in this repo are
designed to work with node version 16.

Install the dependencies:

```bash
npm install
```

:Build the typescript and package it for distribution

```bash
npm run build && npm run package
```

Run the tests :heavy_check_mark:  

```text
$ npm test

 PASS  src/__tests__/maintainizr-api.test.ts
  Start maintenance
    √ calls the API endpoint correctly (4 ms)
    √ returns the maintenance object when successful (1 ms)
    √ handles API error (1 ms)
  End maintenance
    √ calls the API endpoint correctly (1 ms)
    √ handles API error (1 ms)

...

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        3.721 s
Ran all test suites.

```

### Committing and publishing changes

Actions are run directly from GitHub repos so we need to checkin the generated `dist/` folder. Yes,
this is a horrible practice, but it's necessary for how GH Actions operate.

We use [ncc](https://github.com/@vercel/ncc) to generate the packed code in the `dist/` directory.
You can run this via the command below:

```bash
npm run build && npm run package
```

Your action is now published! :rocket:

:warning: Don't forget to package the contents before you commit any changes to the source code for
an action.

#### Automatic safeguards

If you forget to publish before committing your changes, there are a couple of safeguards:

1. A [Husky](https://github.com/typicode/husky) pre-commit hook that performs a simple check that
   you have staged changes to `dist/` if you have staged any changes to `src/`.

2. A [GitHub workflow](./.github/workflows/check-dist.yml) that runs as part of the PR validation
   process. This workflow rebuilds the `dist/` folder and compares it to the committed version,
   failing if it detects a discrepancy.

If you need to bypass the pre-commit hook for any reason, you can use `git commit --no-verify` to
prevent the hook from running. This allows you to commit changes if the hook detects a false
positive. This should really only be used for emergencies - if there is a genuine false positive,
you are encouraged to fix the [pre-commit hook](./.husky/pre-commit) to eliminate the error.

There is no way to bypass the CI checks - there is no valid reason to commit code that hasn't been
packaged, and certainly not to add it to a PR.

TODO: versioning workflow
See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
