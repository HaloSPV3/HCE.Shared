# HCE.Shared
Infrastructure resources shared with other HaloSPV3 repositories.

It is recommended to "install" this repo via [Node Package Manager](#npm)

## NPM

### Usage

`npm install --save-dev HaloSPV3/HCE.Shared`

See [package.json](package.json), [src/index.ts](src/index.ts), and [static/.releaserc.yml](static/.releaserc.yml)

#### Set Up CommitLint

```json
// package.json
{
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  }
}
```

```bash
npx husky install
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

### Help

#### Need your VersionInfo before the actual release?

Make sure you are synced up before doing a dry-run! Semantic-release will fail before printing the version if you aren't synced with the remote!
Yes, I know that's ridiculous.
Run `npx semantic-release --dry-run --plugins "@semantic-release/commit-analyzer,semantic-release-export-data"`
If the first plugin doesn't run into any issues and infers a version bump from unreleased commits, it will print the next version to the console.
The [second plugin](https://github.com/felipecrs/semantic-release-export-data#readme) will export the next version and other information as GitHub Action Step exports.

#### Don't want to publish a Node package? 

Add the following to your `package.json`:
```json
{
    "private": true,
}
```

## .NET

See [dotnet/](dotnet/)

GitHub Actions workflow examples are in [dotnet/.github/workflows/](dotnet/.github/workflows/).

#### TODO:

Eventually, I hope to make boilerplate workflows useable from via relative paths e.g.
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

### Directory.Build.props

Add the file `Directory.Build.props` to your repository's root directory or solution directory if you haven't already.
Then, add the following properties:
```xml
<Project>
    <PropertyGroup>
        <ProjectRootDir>$([MSBuild]::GetDirectoryNameOfFileAbove($(MSBuildThisFileDirectory), '.git/index'))</ProjectRootDir>
        <HCESharedDir>$(ProjectRootDir)/node_modules/@halospv3/hce.shared/</HCESharedDir>
    </PropertyGroup>
</Project>
```

These may evaluate to the following:
| Property | Evaluated Value|
| - | - |
|`ProjectRootDir` | `c:\Repos\HaloSPV3\HCE.Shared\` |
|`HCESharedDir`| `c:\Repos\HaloSPV3\HCE.Shared\node_modules\@halospv3\hce.shared\` |

<br/>

If you want properties set only in a CI/CD environment (e.g. a GitHub workflow), add the following conditional property group to the props file:
```xml, diff
<Project>
    <PropertyGroup>
        ...
    </PropertyGroup>

    <PropertyGroup Condition=" '$(CI)' == 'true' ">
        <Configuration>Release</Configuration>
        <ContinuousIntegrationBuild>true</ContinuousIntegrationBuild>
   </PropertyGroup>
</Project>
```
> Any properties added to this conditional property group will only be evaluated when `$(CI)` is defined either as a property or as an environment variable. This is most useful for properties such as `ContinuousIntegrationBuild`.

### GitVersion

By default, GitVersion will search only the "current directory" for `GitVersion.yml`. GitVersion has a lesser-known CLI argument, "Path" which allows users to specify the path to `GitVersion.yml`. The NuGet package `GitVersion.MSBuild` exposes this as the read-write property `$(GitVersion_Path)`.
```xml
<PropertyGroup>
    <GitVersion_Path>../SiblingDir/GitVersion.yml</GitVersion_Path>
</PropertyGroup>
```