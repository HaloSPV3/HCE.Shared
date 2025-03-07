TODO.md

refactor(dotnet): re-order constructors' optional parameters; rename arg 'dotnetProject'

# depcheck

- verify all deps are satisfied
- remove unused deps

# MSBuildProject

- src/dotnet/dotnetHelpers.ts:32
- src/dotnet/dotnetHelpers.ts:39
- src/dotnet/dotnetHelpers.ts:58
- src/dotnet/dotnetHelpers.ts:61
- src/dotnet/dotnetHelpers.ts:123
- src/dotnet/GithubNugetRegistryInfo.ts:12
- src/dotnet/GitlabNugetRegistryInfo.ts:30
- src/dotnet/GitlabNugetRegistryInfo.ts:44
- src/dotnet/NugetRegistryInfo.ts:26
- src/dotnet/NugetRegistryInfo.ts:81
- src/dotnet/NugetRegistryInfo.ts:378

# nuget rework

- [x] refactor canPushPackagesToUrl away from static dummy

but it doesn't have --dry-run and the request for it has been open for three years with no progress.
So, I have to jerry rig effectively equivalent functionality out of existing NuGet features and it has been extremely draining.

- If the authorization token DOES NOT have permission to push new versions/packages for the given package ID, fail the release.
- If the package ID already has the new version listed, fail the release.

Both are accomplished by the following:

- grab the new version during Prepare
- ~~copy our pre-made, lightweight v0.0.1-DUMMY dummy package. Overwrite its PackageID with the real ID.~~
- Invoke `dotnet pack proj/Path -p:Version=0.0.1-DUMMY`
- query the NuGet source (i.e. package registry/server) for the package ID and check the existing package versions for the "new version" we want to publish.
- `dotnet nuget push ./publish/${PackageId}.0.0.1-DUMMY.nupkg -source NugetSourceName --api-key private_token --skip duplicate`. That last part tells the Source it's okay if the dummy package already exists. The only error we would get is if the token lacks permission.

Repeat for every given PackageId, per each NuGet source. Each PackageId will need one auth token per Source.

If no errors occur, proceed with the rest of the release procedure.

# Per-lang SonarLint

eslint-plugin-sonarjs
https://github.com/SonarSource/sonar-scanner-npm

https://github.com/SonarSource/sonar-scanner-msbuild
https://www.nuget.org/packages/SonarAnalyzer.CSharp
https://www.nuget.org/packages/dotnet-sonarscanner
