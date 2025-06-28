# TODO.md

## depcheck

- verify all deps are satisfied
- remove unused deps

## MSBuildProject

- src/dotnet/helpers.ts:32
- src/dotnet/helpers.ts:39
- src/dotnet/helpers.ts:58
- src/dotnet/helpers.ts:61
- src/dotnet/helpers.ts:123
- src/dotnet/GithubNugetRegistryInfo.ts:12
- src/dotnet/GitlabNugetRegistryInfo.ts:30
- src/dotnet/GitlabNugetRegistryInfo.ts:44
- src/dotnet/NugetRegistryInfo.ts:26
- src/dotnet/NugetRegistryInfo.ts:81
- src/dotnet/NugetRegistryInfo.ts:378

## nuget rework

- [x] refactor canPushPackagesToSource away from static dummy
  > it doesn't have --dry-run and the request for it has been open for three
years with no progress. So, I have to jury rig equivalent
functionality out of existing NuGet features and it has been extremely draining.

- [x] If the authorization token DOES NOT have permission to push new
  versions/packages for the given package ID, fail the release.
- If the package ID already has the new version listed, fail the release.

Both are accomplished by the following:

- grab the new version during Prepare
- ~~copy our pre-made, lightweight v0.0.1-DUMMY dummy package. Overwrite its
  PackageID with the real ID.~~
- Invoke `dotnet pack proj/Path -p:Version=0.0.1-DUMMY`
- query the NuGet source (i.e. package registry/server) for the package ID and
  check the existing package versions for the "new version" we want to publish.
- `dotnet nuget push ./publish/${PackageId}.0.0.1-DUMMY.nupkg -source NugetSourceName --api-key private_token --skip-duplicate`.
  That last part tells the Source it's okay if the dummy package already exists.
  The only error we would get is if the token lacks permission.

Repeat for every given PackageId, per each NuGet source. Each PackageId will
need one auth token per Source.

If no errors occur, proceed with the rest of the release procedure.

## FIXUPS

- dotnet.samples.README
  - remove comma in .d.ts
- TODO
  - remove comma in .d.ts
  - single-line
- fix chore(dotnet...) with bad scope
- add scope `eslintconfig` before `feat(eslintConfig): export config array separately from default export`
- fix test(semanticReleaseConfigDotnet): rename test file to match source file; rewrite for class-based approach
- FIXUP: split github feats to preceding commit
- FIXUP: Remove dot prefixes from oaths in scope descriptions
- FIXUP: add scope `release`
- FIXUP: "move to own file" should always be `feat`
- FIXUP: all `add scope` should be `chore`
- FIXUP: all `build(commitlint)` commits should be `chore(commitlint)`!
- FIXUP: ``` feat(dotnet.NRI): add `GetIsNextVersionAlreadyPublishedCommand`, `getGithubOutput`, `getGithubOutputSync` ```
  - should use indexed ENV access
  - refactor(dotnet.NRI): add explicit return type to `getGithubOutput`
  - refactor(dotnet.NRI): non-null assert successful return of `configDotenv`
- FIXUP: fix rename `tokenEnvVar`->`resolveEnvVariable` of `_GetTokenValue`
  - docs(dotnet.NRI): update `@param resolveEnvVariable` name, description
- FIXUP: docs(Dotnet.MSBP): update param `opts` properties' names; document them
  - Did I really do "Dotnet"?
- <https://jsr.io/docs/publishing-packages#publishing-from-github-actions>
- ADD: test(dotnet.GLNRI): un-nest `GLNRI` instance tests; add tests for `canPushPackagesToSource`
- REFACTOR: move token tests out of `canPushPackagesToSource`; run them during `verifyConditions`.
