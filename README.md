# HCE.Shared
Infrastructure resources shared with other HaloSPV3 repositories.

It is recommended to "install" this repo via [Node Package Manager](#npm)

## Usage


### 1. Install `@halospv3/hce.shared-config`

This project is packaged and published via NPM. As such...
```sh
npm install --save-dev @halospv3/hce.shared-config
```

### 2. Customize Semantic Release

```json
// package.json
{
  "release": {
    "extends": [
        "@halospv3/hce.shared-config"
    ]
  }
}
```

WARNING! Defining a property will *overwrite* the previous value. Arrays and objects are *not* merged. You can...
- Assign to top-level variables to avoid modifying the plugins array.
- Write your config in CJS and manually merge objects and arrays.

**Configs**
- `hce.shared-config`: [static/.releaserc.yml](static/.releaserc.yml)
- [dotnet/.releaserc.cjs](dotnet/.releaserc.cjs) based on [BinToss/GroupBox.Avalonia's Semantic Release config](https://github.com/BinToss/GroupBox.Avalonia).

**Notable Plugin Properties**
- [`@semantic-release/commit-analyzer`](https://github.com/semantic-release/commit-analyzer#options)
  - preset (set to conventionalcommits)
  - parserOpts
  - releaseRules
- [`@semantic-release/release-notes-generator`](https://github.com/semantic-release/release-notes-generator#options)
  - preset (set to conventionalcommits)
  - parserOpts
  - writerOpts
- [`@semantic-release/changelog`](https://github.com/semantic-release/changelog#options)
  - changelogFile (default: CHANGELOG.md)
- [`@semantic-release/git`](https://github.com/semantic-release/git#options)
  - assets (default: ['CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json'])
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
    "extends": [
        "./node_modules/@halospv3/hce.shared-config/commitlint.config.ts"
    ]
  }
}
```

```sh
npx husky
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

### 4. (dotnet) Add/Edit Directory.Build.props


> Example Directory.Build.props from [BinToss/GroupBox.Avalonia](https://github.com/BinToss/GroupBox.Avalonia)

```xml
<Project>
  <PropertyGroup>
    <RepoRoot Condition="'$(RepoRoot)' == ''">$([MSBuild]::GetDirectoryNameOfFileAbove($(MSBuildThisFileDirectory), '.git/index'))</RepoRoot>
    <HCESharedDir Condition="'$(HCESharedDir)' == ''">$(RepoRoot)node_modules/@halospv3/hce.shared-config/</HCESharedDir>
    <GitVersion_Path Condition="'$(GitVersion_Path)' == ''">$(HCESharedDir)GitVersion.yml</GitVersion_Path>
    <AvaloniaVersion>11.0.10</AvaloniaVersion>
  </PropertyGroup>

  <PropertyGroup Condition="'$(CI)' == 'true'">
    <Configuration>Release</Configuration>
    <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
    <Deterministic>true</Deterministic>
  </PropertyGroup>

  <Import Project="$(HCESharedDir)/dotnet/ZipPublishDir.targets" />
</Project>
```

----

Add the file `Directory.Build.props` to your repository's root directory or solution directory if you haven't already.
Then, add the following properties:
```xml
<Project> <!-- Minimal requirements for dotnet/msbuild integration -->
    <Import Project="./node_modules/@halospv3/hce.shared-config/dotnet/ZipPublishDir.targets" />
    <PropertyGroup>
        <ProjectRootDir>$([MSBuild]::GetDirectoryNameOfFileAbove($(MSBuildThisFileDirectory), '.git/index'))</ProjectRootDir>
        <HCESharedDir>$(ProjectRootDir)/node_modules/@halospv3/hce.shared-config/</HCESharedDir>
    </PropertyGroup>
</Project>
```

These may evaluate to the following:
| Property | Evaluated Value|
| - | - |
|`ProjectRootDir` | `c:\Repos\HaloSPV3\HCE.Shared\` |
|`HCESharedDir`| `c:\Repos\HaloSPV3\HCE.Shared\node_modules\@halospv3\hce.shared-config\` |

<br/>

#### CI/CD-Only Properties

If you want properties set only in a CI/CD environment (e.g. a GitHub workflow), add the following conditional property group to the props file:
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
> Any properties added to this conditional property group will only be evaluated when `$(CI)` is defined either as a property or as an environment variable. This is most useful for properties such as `ContinuousIntegrationBuild`.

#### GitVersion

By default, GitVersion will search only the "current directory" for `GitVersion.yml`. GitVersion has a lesser-known CLI argument, "Path" which allows users to specify the path to `GitVersion.yml`. The NuGet package `GitVersion.MSBuild` exposes this as the read-write property `$(GitVersion_Path)`.

If you're satisfied by [dotnet/GitVersion.yml](dotnet/GitVersion.yml), you can configure GitVersion to use this config file. GitVersion does not have 'extend' functionality typical of Node.js packages.
```xml
<PropertyGroup>
    <GitVersion_Path>$(ProjectRootDir)/node_modules/@halospv3/hce.shared-config/dotnet/GitVersion.yml</GitVersion_Path>
</PropertyGroup>
```

## Tips

### Need your VersionInfo before the actual release?

If you want to use this information in other Semantic Release steps, you'll need `semantic-release-export-data`.
```sh
npm i -D semantic-release-export-data
```

Run the following to preview the version:
```sh
npx semantic-release --dry-run --plugins "@semantic-release/commit-analyzer,semantic-release-export-data"
```
If the first plugin doesn't run into any issues and infers a version bump from unreleased commits, it will print the next version to the console.
The [second plugin](https://github.com/felipecrs/semantic-release-export-data#readme) will export the next version and other information as GitHub Action Step exports.

### Don't intend to publish a Node package? 

Add the following to `package.json`:
```json
{
    "private": true,
}
```

## TODO:

### Reusable, configurable GitHub workflows

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

### Ease Semantic Release Configuration

JSON/YAML configs *could* have merge-edit capabilities driven by data from custom, top-level properties. Each property would contain the command moniker and the config data (parameters) similar to RPC implementations.
This will require quite a bit of datatype validation behind the scenes.
```json
{
  "modify_plugins": {
    "op": "Append",
    "data": [
      [
        "newplugin",
        {
          "newpluginoption": true
        }
      ]
    ]
  }
}
```