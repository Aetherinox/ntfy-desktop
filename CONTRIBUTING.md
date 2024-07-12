<div align="center">
<h1>Ntfy Desktop 🔅</h1>
<br />
<p>Contributor Documentation</p>

<br />

<!-- prettier-ignore-start -->
[![Test Status][test-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Version][version]][package]
[![Last Commit][badge-commit]][badge-commit]
[![Size][badge-size]][badge-size]
[![All Contributors][all-contributors-badge]](#contributors-)
<!-- prettier-ignore-end -->

</div>

---

<br />

- [Submitting Bugs](#submitting-bugs)
- [Contributing](#contributing)
  - [Pull requests eligible for review](#pull-requests-eligible-for-review)
  - [Conventional Commit Specification](#conventional-commit-specification)
    - [Types](#types)
      - [Example 1:](#example-1)
      - [Example 2:](#example-2)
  - [References](#references)
  - [Code Styling](#code-styling)
  - [Spaces Instead Of Tabs](#spaces-instead-of-tabs)
  - [Commenting](#commenting)
  - [Casing](#casing)


---

<br />

## Submitting Bugs

Please ensure that when you submit bugs; you are detailed.

* Explain the issue
* Describe how the function should operate, and what you are experiencing instead.
* Provide possible options for a resolution or insight

<br />

---

<br />

## Contributing

The source is here for everyone to collectively share and colaborate on. If you think you have a possible solution to a problem; don't be afraid to get your hands dirty.

Unless you are fixing a known bug, we strongly recommend discussing it with the core team via a GitHub issue before getting started to ensure your work does not conflict with future plans.

All contributions are made via pull requests. To make a pull request, you will need a GitHub account; if you are unclear on this process, see [GitHub's documentation on forking and pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork). Pull requests should be targeted at the master branch. 

<br />

### Pull requests eligible for review

- Follow the repository's code formatting conventions (see below);
- Include tests that prove that the change works as intended and does not add regressions;
- Document the changes in the code and/or the project's documentation;
- Pass the CI pipeline;
- Include a proper git commit message following the [Conventional Commit Specification](https://conventionalcommits.org/en/v1.0.0/#specification).

<br />

If all of these items are checked, the pull request is ready to be reviewed and you should change the status to "Ready for review" and request review from a maintainer.

Reviewers will approve the pull request once they are satisfied with the patch.

<br />

### Conventional Commit Specification

When commiting your changes, we require you to follow the Conventional Commit Specification, described below.

**The Conventional Commits** is a specification for the format and content of a commit message. The concept behind Conventional Commits is to provide a rich commit history that can be read and understood by both humans and automated tools. Conventional Commits have the following format:

<br />

```
<type>[(optional <scope>)]: <description>

[optional <body>]

[optional <footer(s)>]
```

#### Types
| Type | Description |
| --- | --- |
| `feat` | Introduces a new feature |
| `fix` | A bug fix for the end user |
| `docs` | A change to the website or Markdown documents |
| `build` | The commit alters the build process. E.g: creating a new build task, updating the release script, editing Makefile. |
| `test` | Adds missing tests, refactoring tests; no production code change. Usually changes the suite of automated tests for the product. |
| `perf` | Improves performance of algorithms or general execution time of the product, but does not fundamentally change an existing feature. |
| `style` | Updates or reformats the style of the source code, but does not otherwise change the product implementation. Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| `refactor` | A change to production code that leads to no behavior difference, e.g. splitting files, renaming internal variables, improving code style, etc. |
| `change` | Changes the implementation of an existing feature. |
| `chore` | Includes a technical or preventative maintenance task that is necessary for managing the product or the repository, but is not tied to any specific feature. E.g. updating dependencies. These are usually done for maintanence purposes. |
| `ci` | Changes related to Continuous Integration (usually `yml` and other configuration files). |
| `misc` | Anything else that doesn't change production code, yet is not ci, test or chore. |
| `revert` | Revert to a previous commit |
| `remove` | Removes a feature from the product. Typically features are deprecated first for a period of time before being removed. Removing a feature from the product may be considered a breaking change that will require a major version number increment. |
| `deprecate` | Deprecates existing functionality, but does not remove it from the product. |

<br />

##### Example 1:

```
feat(core): allow overriding of webpack config
^───^────^  ^────────────────────────────────^
│   │       │
│   │       └───⫸ (DESC):   Summary in present tense. Use lower case not title case!
│   │
│   └───────────⫸ (SCOPE):  The package(s) that this change affects
│
└───────────────⫸ (TYPE):   See list above
```

<br />

##### Example 2:
```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|
  │                          elements|forms|http|language-service|localize|platform-browser|
  │                          platform-browser-dynamic|platform-server|router|service-worker|
  │                          upgrade|zone.js|packaging|changelog|docs-infra|migrations|ngcc|ve|
  │                          devtools....
  │
  └─⫸ Commit Type: build|ci|doc|docs|feat|fix|perf|refactor|test
                    website|chore|style|type|revert|deprecate
```

<br />

### References
If you are pushing a commit which addresses a submitted issue, reference your issue in the description of your commit. You may also optionally add the major issue to the end of your commit title.

References should be on their own line, following the word `Ref` or `Refs`

```
Title:          fix(core): fix error message displayed to users. [#22]
Description:    The description of your commit

                Ref: #22, #34, #37
```

<br />

### Code Styling
This repo utilizes [prettier](https://npmjs.com/package/prettier) and [eslint](https://npmjs.com/package/eslint) for formatting. Prior to a pull request being approved; ensure you lint your code with the following settings for prettier:

```json
printWidth: 120,
tabWidth: 4,
useTabs: false,
semi: true,
singleQuote: true,
quoteProps: 'preserve',
jsxSingleQuote: true,
trailingComma: 'none',
bracketSpacing: true,
bracketSameLine: false,
arrowParens: 'always',
proseWrap: 'preserve',
htmlWhitespaceSensitivity: 'ignore',
endOfLine: 'auto',
embeddedLanguageFormatting: 'auto',
singleAttributePerLine: false
```

<br />

### Spaces Instead Of Tabs
When writing your code, set your IDE to utilize **spaces**, with a configured tab size of `4 characters`.

<br />

### Commenting
Comment your code. If someone else comes along, they should be able to do a quick glance and have an idea of what is going on. Plus it helps novice readers to better understand the process.

You may use block style commenting, or single lines:

```javascript
/*
    make platform writable
*/

Object.defineProperty(process, 'platform', {
    value: platform,
    writable: true
});

afterEach(() => {
    process.platform = platform;
    process.env.OSTYPE = OSTYPE;
});

/*
    tests to decide if the end-user is running on Darwin or another platform.
*/

test(`Return true if platform is Darwin`, () => {
    process.platform = 'darwin';
    expect(bIsDarwin()).toBe(true);
});

test(`Return false if platform is not Darwin`, () => {
    process.platform = 'linux';
    expect(bIsDarwin()).toBe(false);
});
```

<br />

### Casing
When writing your code, ensure you stick to `camelCase`

```javascript
let myVar = 'one';
let secondVar = 'two';
```

<br />

<!-- prettier-ignore-start -->
[npm]: https://npmjs.com
[node]: https://nodejs.org
[badge-commit]: https://img.shields.io/github/last-commit/Aetherinox/ntfy-desktop?color=b43bcc
[badge-size]: https://img.shields.io/github/repo-size/Aetherinox/ntfy-desktop?label=size&color=59702a
[test-badge]: https://img.shields.io/github/actions/workflow/status/Aetherinox/ntfy-desktop/npm-tests.yml?logo=github&label=Tests&color=%23278b30
[build]: https://github.com/Aetherinox/ntfy-desktop/actions/workflows/npm-publish.yml?query=workflow%3Anpm-publish.yml
[coverage-badge]: https://img.shields.io/codecov/c/github/Aetherinox/xsumjs?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[coverage]: https://codecov.io/github/Aetherinox/ntfy-desktop
[version]: https://img.shields.io/npm/v/@aetherinox/ntfy-desktop
[package]: https://npmjs.com/package/@aetherinox/ntfy-desktop
[downloads-badge]: https://img.shields.io/npm/dm/ntfy-desktop.svg
[npmtrends]: http://npmtrends.com/ntfy-desktop
[license-badge]: https://img.shields.io/npm/l/ntfy-desktop.svg
[license]: https://github.com/Aetherinox/ntfy-desktop/blob/master/LICENSE
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/Aetherinox/ntfy-desktop?color=de1f6f&label=contributors
[cross-spawn]: https://www.npmjs.com/package/cross-spawn
[ts-loader]: https://www.npmjs.com/package/ts-loader
[win-bash]: https://msdn.microsoft.com/en-us/commandline/wsl/about
<!-- prettier-ignore-end -->
