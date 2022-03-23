# Developing and Releasing

## Building and testing locally

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

## Packaging and Committing changes

Actions are run directly from GitHub repos so we need to commit the generated `dist/` folder. Yes,
in general this is a horrible practice :grimacing:, but in this case it's necessary for how GH
Actions operate.

We use [ncc](https://github.com/@vercel/ncc) to generate the packed code in the `dist/` directory.
You can run this via the command below:

```bash
npm run build && npm run package
```

:warning: Don't forget to package the contents before you commit any changes to the source code for
an action.

### Automatic safeguards

In case you forget to package before committing your changes, there are a couple of safeguards:

1. A [Husky](https://github.com/typicode/husky) pre-commit hook that performs a simple check that
   you have staged changes to `dist/`, if you have staged any changes to `src/`.

2. A [GitHub workflow](./.github/workflows/check-dist.yml) that runs as part of the PR validation
   process. This workflow rebuilds the `dist/` folder and compares it to the committed version,
   failing if it detects a discrepancy.

If you need to bypass the pre-commit hook for any reason, you can use `git commit --no-verify` to
prevent the hook from running. This allows you to commit changes if the hook detects a false
positive. This should really only be used for emergencies - if there is a genuine false positive,
you are encouraged to fix the [pre-commit hook](./.husky/pre-commit) to eliminate the error.

There is no way to bypass the CI checks - there is no valid reason to commit code that hasn't been
packaged, and certainly not to add it to a PR.

## Releasing a new version

Versioning for these actions is based on GitHub's [action
versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
recommendations, with some workflows that automate much of the process.

The release automation tooling relies on the [changelog](../CHANGELOG.md) to detect the current
version number. The changelog is assumed to follow [keep a
changelog](https://keepachangelog.com/en/1.0.0/) conventions.

### Update the changelog

Release preparation starts by ensuring that the changelog is up to date. The tools assume that the
changes have been documented in the `Unreleased` section of the changelog, and the process will fail
if the section is not present. This is to ensure that each release is properly documented for
consumers.

### Preparing a release PR

Once the `Unreleased` section of the changelog is up to date, it's time to prepare a PR that bumps
the changelog version. This step is automated - all you need to do is to run the `[autorelease]
Prepare release PR` GitHub Action. This generates a PR that updates the changelog with the next
version number (when running the action, you can select what kind of version bump to perform, e.g.
major, minor, patch, etc.).

Typically, you will run this action on the `main` branch, as releases are mostly taken from there.
You might also run this from a `release/*` branch, if you needed to release a fix on an old version
(as depicted in the GitHub action versioning documentation mentioned above).

### Validate and merge the release PR

Once the PR is created, all you need to do is sanity check the contents of the PR, and then merge it
back onto the original branch. You should do this as soon as possible, because you don't want to
include anything other than the code that was on the original branch when you created the release
PR. **Don't attempt to rebase subsequent changes from the original branch onto the release PR** -
this is not supported. If changes have been merged onto the original branch since you created the
release PR, you should abandon that PR and start over.

### Publish the release

When the release PR is merged, it triggers an automated workflow that creates a draft GitHub
release. All you need to do now is validate the release, then publish it.

Your action is now published! :rocket:

You should also now create or update the major version tag, e.g. `v1`. This is currently a manual
task, but automation will be added shortly. The process is described in the action versioning
[documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md).
