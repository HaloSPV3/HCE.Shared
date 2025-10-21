# HCE.Shared

[![.github/workflows/npm-release.yml](https://github.com/HaloSPV3/HCE.Shared/actions/workflows/npm-release.yml/badge.svg?branch=next%2F3.x&event=push)](https://github.com/HaloSPV3/HCE.Shared/actions/workflows/npm-release.yml)

Infrastructure resources shared with other HaloSPV3 repositories.

**NOTE**
HCE.Shared's API offers convenience and flexibility not present in similar .NET/NuGet-publishing NPM packages, but this project is incredibly messy. You'll find many traces of scrapped or unfinished ideas in the form of both documentation and code. These wrinkles will be ironed out before `3.x` is merged into `main`.

## Usage

### 1. Install `@halospv3/hce.shared-config`

This project is packaged and published via NPM. As such...

```sh
npm install --save-dev @halospv3/hce.shared-config
```

### 2. Customize Semantic Release

WARNING! Defining a property will _overwrite_ the previous value. Arrays and
objects are _not_ merged. You can...

- Assign to certain top-level variables (e.g. `options.preset`) to avoid
  modifying the plugins array. Caveat: only _some_ plugins read these properties.
- Write your config in MJS; It is recommended you use
  [deepmerge](https://www.npmjs.com/package/deepmerge) to recursively merge
  objects and arrays instead of using `extends`. Doing so will allow your IDE to
  tell you when a shareable config cannot be found.

#### Base Config

> - Uses the [conventionalcommits preset](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits).
> - Releases `main` branch; Pre-releases `develop`.
> - Adds and configures [`semantic-release-export-data`](https://github.com/felipecrs/semantic-release-export-data) to export `new-release-published` and `new-release-version` to GitHub Actions' outputs.
> - Adds and configures [`@semantic-release/changelog`](https://github.com/semantic-release/changelog) to update CHANGELOG.md.
> - Configures [`@semantic-release/git`](https://github.com/semantic-release/git) to add README.md and CHANGELOG.md in a release commit if they have changes. Uses GitHub job's token to commit.
> - Configures [`@semantic-release/github`](https://github.com/semantic-release/github) to release all files found in `$PWD/publish`.

##### Base Config - Usage

```js
// releaserc.config.js
import hceSharedConfig from '@halospv3/hce.shared-config';

// modify it however you wish before the export statement!

export default hceSharedConfig;
```

```js
// releaserc.config.js
export default {
  extends: ['@halospv3/hce.shared-config'],
};
```

```json
// package.json
{
  "release": {
    "extends": ["@halospv3/hce.shared-config"]
  }
}
```

#### Dotnet Config

> An extension of our base config.
>
> Exports a function with parameters for 'projects to pack' and 'projects to push (to nuget)'.
> Although `@halospv3/hce.shared-config/semanticReleaseConfigDotnet` can be used
> via `extends` and configured via the `PROJECTS_TO_PUBLISH` and
> `PROJECTS_TO_PACK_AND_PUSH` environment variables, it is recommended to call
> the function and pass it parameters so errors are caught before they reach
> production.
>
> Differences to the base config:
>
> - Utilizes `@semantic-release/exec` for shell commands.
>   - Executes `dotnet publish` and `dotnet pack` upon the configured projects during the `prepare` step.
>   - (WIP) Executes `dotnet nuget sign` during `prepare` upon the `dotnet pack` outputs if `projectsToPackAndPush` is not set to `false` (default: `[]`).
>   - Executes `dotnet nuget push` during the `publish` step.

##### Dotnet Config - Usage

TODO: add "non-best-guess" config example

For a basic "best-guess" config...

```ts
// releaserc.config.js
// TODO: getConfig was removed. Update instructions!
import { getConfig } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';

/* Caveat: semantic-release will version and release all specified projects under the same Git tags and GitHub releases.
 * To version and release them separately, use [https://github.com/pmowrer/semantic-release-monorepo](semantic-release-monorepo).
 */

/* `prepareCmd` will contain command lines to publish
 * both Library and Sample to your GitHub release.
 * Their `TargetFrameworks` and `RuntimeIdentifiers`
 * properties will be evaluated and a command line
 * will be added for each unique combination,
 * _regardless of compatibility and intended combinations_.
 */
const projectsToPublish = [
  './Library/Library.csproj',
  './Sample/Sample.csproj',
];
/*
 * `prepareCmd` will also contain `dotnet pack` and
 * `dotnet nuget sign` commands to pack Library to a nupkg.
 * `publishCmd` will contain `dotnet nuget push` commands
 *  to push Library to Nuget.org and GitHub Package Registry.
 */
const projectsToPackAndPush = ['./Library/Library.csproj'];

// runs getConfig and exports its return value
export default await getConfig(projectsToPublish, projectsToPackAndPush);
```

###### `extends` key in a javascript config file

Using `extends` is NOT recommended, but I won't stop you.
Your projects' paths must be assigned to environment variables. See [Dotnet Config](#dotnet-config).

```js
// releaserc.config.js (if {"type": "module"} in package.json)
export default {
  extends: ['@halospv3/hce.shared-config'],
};
```

```js
// releaserc.config.js (if {"type": "commonjs"} in package.json)
module.exports = {
  extends: ['@halospv3/hce.shared-config'],
};
```

###### `release` key in package.json

```json
// package.json
// `npm install --save-dev cross-env`
{
  "scripts": {
    "release": "cross-env PROJECTS_TO_PUBLISH=\"./Library/Library.csproj;./Sample/Sample.csproj\" semantic-release"
  },
  "release": {
    "extends": ["@halospv3/hce.shared-config/semanticReleaseConfigDotnet"]
  }
}
```

---

#### Notable Plugin Properties

- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer#options)
  - preset (set to `conventionalcommits`)
  - parserOpts
  - releaseRules
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator#options)
  - preset (set to `conventionalcommits`)
  - parserOpts
  - writerOpts
- [`@semantic-release/changelog`](https://github.com/semantic-release/changelog#options)
  - changelogFile (default: `'CHANGELOG.md'`)
- [`@semantic-release/git`](https://github.com/semantic-release/git#options)
  - assets (default:
    `['README.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json']`)
- `@semantic-release/exec`
  - prepareCmd
- [`@semantic-release/github`](https://github.com/semantic-release/github#options)
  - assets
  - draftRelease (default: false)

### 3. Set Up CommitLint

```json
// package.json
{
  "commitlint": {
    "extends": ["@halospv3/hce.shared-config/commitlintConfig"]
  }
}
```

or

```ts
/* eslint-disable import/no-default-export */
import commitlintConfig from '@halospv3/hce.shared-config/commitlintConfig';

export default commitlintConfig;
```

Then...

```sh
npx husky
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

### 4. (dotnet) Add/Edit Directory.Build.props

```xml
<Project>
  <Import Project="$(HCESharedDir)/dotnet/HCE.Shared.targets"/>

  <PropertyGroup>
    <RepoRoot Condition="'$(RepoRoot)' == ''">$([MSBuild]::GetDirectoryNameOfFileAbove($(MSBuildThisFileDirectory), '.git/index'))</RepoRoot>
    <HCESharedDir Condition="'$(HCESharedDir)' == ''">$(RepoRoot)node_modules/@halospv3/hce.shared-config/</HCESharedDir>
    <!--<GitVersion_Path Condition="'$(GitVersion_Path)' == ''">Path/To/Your/GitVersion.yml</GitVersion_Path>-->
  </PropertyGroup>
</Project>
```

These may evaluate to the following:

| Property       | Evaluated Value                                                          |
| -------------- | ------------------------------------------------------------------------ |
| `RepoRootDir`  | `c:\Repos\HaloSPV3\HCE.Shared\`                                          |
| `HCESharedDir` | `c:\Repos\HaloSPV3\HCE.Shared\node_modules\@halospv3\hce.shared-config\` |

#### CI/CD-Only Properties

> Note: Already included when importing HCE.Shared.targets
> If you don't import HCE.Shared.targets, you may import HCE.Shared.CI.props or define your own conditional property group.

If you want properties set only in a CI/CD environment (e.g. a GitHub workflow), add the following
conditional property group to the props file:

```xml, diff
<Project>
  <PropertyGroup>
    ...
  </PropertyGroup>

  <PropertyGroup Condition=" '$(CI)' == 'true' ">
    <Configuration>Release</Configuration>
    <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
    <Deterministic>true</Deterministic>
  </PropertyGroup>
</Project>
```

> Any properties added to this conditional property group will only be evaluated when `$(CI)` is
> defined either as a property or as an environment variable. This is most useful for properties
> such as `ContinuousIntegrationBuild`.

#### GitVersion

By default, GitVersion will search only the "current directory" for `GitVersion.yml`. GitVersion has
a lesser-known CLI argument, "Path" which allows users to specify the path to `GitVersion.yml`. The
NuGet package `GitVersion.MSBuild` exposes this as the read-write property `$(GitVersion_Path)`.

If you're satisfied by [dotnet/GitVersion.yml](dotnet/GitVersion.yml), you can configure GitVersion
to use this config file. GitVersion does not have 'extend' functionality typical of Node.js
packages.

You can...

...define it yourself

```xml
<Project>
  <PropertyGroup>
    <GitVersion_Path>$(ProjectRootDir)/node_modules/@halospv3/hce.shared-config/dotnet/GitVersion.yml</GitVersion_Path>
  </PropertyGroup>
</Project>
```

...import HCE.Shared.props

```xml
<Project>
  <Import Project="$(HCESharedDir)/dotnet/HCE.Shared.props">
</Project>
```

...import HCE.Shared.Targets (which imports HCE.Shared.props)

```xml
<Project>
  <Import Project="$(HCESharedDir)/dotnet/HCE.Shared.props">
</Project>
```

## Tips

### Need your VersionInfo before the actual release?

If you want to use this information in other Semantic Release steps, you'll need
`semantic-release-export-data`.

Run the following to preview the version:

```sh
npx semantic-release --dry-run --plugins "@semantic-release/commit-analyzer,semantic-release-export-data"
```

If the first plugin doesn't run into any issues and infers a version bump from unreleased commits,
it will print the next version to the console. The
[second plugin](https://github.com/felipecrs/semantic-release-export-data#readme) will export the
next version and other information as [GitHub Action Step outputs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-using-output-as-url).

### Don't intend to publish a Node package?

Add the following to `package.json`:

```json
{
  "private": true
}
```

## WIP

### Reusable, configurable GitHub workflows

See callable workflows such as [dotnet-ci](./.github/workflows/dotnet-ci.yml)

```yml
jobs:
  release:
    steps:
    - uses: actions/checkout@v3
    - name: dotnet build/publish; copy release artifacts to './publish/'
      uses: ./node_modules/@halospv3/hce.shared/dotnet/.github/workflows/dotnet-release.yml
        with:
          projects:
          - src/lib/lib.csproj
          - src/lib-sample/sample.csproj
```
