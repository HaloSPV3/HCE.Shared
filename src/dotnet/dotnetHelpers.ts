import { MSBuildProject } from './MSBuildProject.js'
import type { NugetRegistryInfo } from './NugetRegistryInfo.js'

/** args appended to "dotnet publish", joined by space */
function appendCustomProperties(args: string[], proj: MSBuildProject, publishProperties: readonly string[] | string[]): void {
  // convert to dictionary and filter for user-defined properties.
  const dictionary = Object.entries(proj.Properties).filter(
    p => !publishProperties.includes(p[0]),
  )
  if (dictionary.length > 0) {
    /* format remaining properties as "-p:Property=Value" and append to args */
    args.push(
      ...dictionary.map(keyValuePair => `-p:${keyValuePair[0]}=${keyValuePair[1]}`),
    )
  }
}

/**
 * Build a prepareCmd string from .NET projects.\
 * This will include a `dotnet publish` for each project's RID and TFM permutation,\
 * `dotnet pack` for each project with output paths separated by NuGet Source and PackageId,\
 * and `dotnet nuget sign` for each nupkg output directory.
 *
 * todo: parse Solution files to publish all projects with default Publish parameters (as evaluated by MSBuild).
 * todo: cleanup, docs
 * todo: change to instance method of SemanticReleaseConfigDotnet
 * @export
 * @param {string[] | MSBuildProject[]} projectsToPublish
 * @param {string[] | NugetRegistryInfo[] | undefined} projectsToPackAndPush
 *  Relative and/or full file paths of projects to pass to `dotnet pack`.
 * @param {string[] } [dotnetNugetSignArgs=['./publish']]
 * Arguments appended to `dotnet nuget sign`. You may append an arbitrary
 * command by splitting it into arguments e.g.
 * [..., '&& dotnet nuget sign your/package/path --certificate-path your/cert/path']
 * This can be used to sign a package with a different key. In fact, any
 * arbitrary command may be added here.
 */
export async function configurePrepareCmd(
  projectsToPublish: string[] | MSBuildProject[],
  projectsToPackAndPush?: string[] | NugetRegistryInfo[],
  dotnetNugetSignArgs: string[] = ['./publish'],
): Promise<string> {
  return [
    await formatDotnetPublish(
      projectsToPublish.map(p =>
        typeof p === 'string'
          ? p
          : p.Properties.MSBuildProjectFullPath),
      MSBuildProject.MatrixProperties),
    formatDotnetPack(projectsToPackAndPush),
    formatDotnetNugetSign(dotnetNugetSignArgs),
    // remove no-op commands
  ].filter(v => v !== undefined)
    .join(' && ')

  async function formatDotnetPublish(projectsToPublish: string[] | MSBuildProject[], publishProperties: readonly string[] | string[]): Promise<string> {
    /* Fun Fact: You can define a property and get the evaluated value in the same command!
    ```pwsh
    dotnet msbuild .\src\HXE.csproj -property:RuntimeIdentifiers="""place;holder""" -getProperty:RuntimeIdentifiers
    place;holder
    ```
      enclosing with """ is required in pwsh to prevent the semicolon from breaking the string.
    */
    if (!Array.isArray(projectsToPublish) || projectsToPublish.length === 0)
      throw new Error(`Type of projectsToPublish (${typeof projectsToPublish}) is not allowed. Expected a string[] or MSBuildProject[] where length > 0.`)

    // each may have TargetFramework OR TargetFrameworks (plural)
    const evaluatedProjects: MSBuildProject[] = await Promise.all(
      projectsToPublish.map(async proj =>
        proj instanceof MSBuildProject
          ? proj
          : await MSBuildProject.Evaluate({
            FullName: proj,
            GetProperty: publishProperties,
            GetItem: [],
            GetTargetResult: [],
            Property: {},
            Targets: ['Pack'],
          }),
      ))

    return evaluatedProjects.flatMap(async (proj) => {
      const props = await proj.Properties
      const args: string[] = [props.MSBuildProjectFullPath]

      appendCustomProperties(args, proj, publishProperties)

      const cmdPermutations: string[][] = [] // forEach, run dotnet [...args,...v]

      /** formatFrameworksAndRuntimes */
      const RIDs: string[] = props.RuntimeIdentifiers.length > 0
        ? props.RuntimeIdentifiers.split(';')
        : []
      const TFMs: string[] = props.TargetFrameworks.length > 0
        ? props.TargetFrameworks.split(';')
        : []
      if (RIDs.length > 0) {
        if (TFMs.length > 0) {
          for (const RID of RIDs) {
            for (const TFM of TFMs) {
              cmdPermutations.push(['--runtime', RID, '--framework', TFM])
            }
          }
        }
        else {
          // assume singular TFM. No need to specify it.
          for (const RID of RIDs) {
            cmdPermutations.push(['--runtime', RID])
          }
        }
      }
      else if (TFMs.length > 0) {
        for (const TFM of TFMs) {
          cmdPermutations.push(['--framework', TFM])
        }
      }

      return cmdPermutations.length > 0
        ? cmdPermutations.map(permArgs => [...args, ...permArgs]) // string[][]
        : [args] // string[][]
    }).map(async args => `dotnet publish ${(await args).join(' ')}`)
      .join(' && ')
  }

  function formatDotnetPack(projectsToPackAndPush?: string[] | NugetRegistryInfo[]): string {
    if (!projectsToPackAndPush)
      return ''
    return projectsToPackAndPush
      .map(proj => `dotnet pack ${typeof proj === 'string' ? proj : proj.project.Properties.MSBuildProjectFullPath}`)
      .join(' && ')
  }

  /**
   * @param {string[]} dotnetNugetSignArgs
   * arguments to append to 'dotnet nuget sign ', joined with spaces.
   * @returns {string} `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `
   */
  function formatDotnetNugetSign(dotnetNugetSignArgs?: string[]): string | undefined {
    if (!dotnetNugetSignArgs || dotnetNugetSignArgs.length === 0)
      return undefined
    return `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `
    //     throw new Error("")
    //     // this needs a rework.
    //     const packagePaths: string[] = [];
    //     dotnetNugetSignArgs.forEach((dotnetNugetSignArgs, i) => {
    //         // if current arg doesn't start with '-' and (current arg is first -OR- previous arg also does not start with '-')...
    //         if (!dotnetNugetSignArgs.startsWith("-") && (i === 0 || (i > 0 && !dotnetNugetSignArgs[i - 1].startsWith("-")))) {
    //             // ...then it's probably a package path.
    //             packagePaths.push(dotnetNugetSignArgs);
    //         }
    //     });
    //     if (packagePaths.length === 0)
    //         return `dotnet nuget sign ${ dotnetNugetSignArgs.join(" ") } `
    //     else return
  }
}

/**
 * todo - split into separate functions. Token verification should be in verifyConditionsCmd. Each package may be signed individually.
 * TODO: completely rewrite
 * @param packageOutputPath
 * @param registries
 * @param pushToGitHub
 * @returns
 */
export async function configureDotnetNugetPush(
  packageOutputPath = './publish',
  registries: NugetRegistryPair[] = [nugetDefault],
  pushToGitHub = true,
  pushToGitLab = false,
): Promise<string> {
  if (registries.some(registry => registry.url.trim() === ''))
    throw new Error('The URL for one of the provided NuGet registries was empty or whitespace.')

  // if user did not specify a GitHub NuGet Registry, try determine default values and add the Source.
  if (pushToGitHub && !registries.some(reg => reg.url.startsWith(GithubNugetRegistryInfo.NUGET_PKG_GITHUB_COM))) {
    const ghPair = await new GithubNugetRegistryInfo().toRegistryPair()
    if (ghPair) {
      registries.push(ghPair)
    }
  }
  if (pushToGitLab) {
    const glPair = await new GitlabNugetRegistryInfo().toRegistryPair()
    if (glPair) {
      registries.push(glPair)
    }
  }

  return registries
    .map((registryPair): string => registryPair.toCommand(packageOutputPath))
    .join(' && ')
}
