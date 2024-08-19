import { ok } from 'node:assert/strict'
import { getEnvVarValue } from '../envUtils.js'
import { MSBuildProject } from './MSBuildProject.js'
import { GithubNugetRegistryInfo } from './GithubNugetRegistryInfo.js'
import { GitlabNugetRegistryInfo } from './GitlabNugetRegistryInfo.js'

/** args appended to "dotnet publish", joined by space */
function appendCustomProperties(args: string[], proj: MSBuildProject, publishProperties: string[]): void {
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
 * Build a prepareCmd string from .NET project paths and `dotnet nuget sign` arguments.
 *
 * todo: parse Solution files to publish all projects with default Publish parameters (as evaluated by MSBuild). If multi-targeting frameworks and/or runtime, evaluate those properties for Publish permutation matrix.
 * todo: cleanup, docs
 * @export
 * @param {string[]} projectsToPublish
 * @param {string[]|false} projectsToPackAndPush Relative and/or full file paths of projects to pass to `dotnet pack`. By default, these will be output to `./publish/`.
 * @param {string[]|false} projectsToPackAndPush Relative and/or full file paths of projects to pass to `dotnet pack`. By default, these will be output to `./publish/`.
 * @param {string[]} dotnetNugetSignArgs Arguments appended to `dotnet nuget sign`. You can also append '&&' if you want to start a new command or if you want to sign different sets of packages with different keys.
 */
export function configurePrepareCmd(
  projectsToPublish: string[],
  projectsToPackAndPush?: string[],
  dotnetNugetSignArgs: string[] = ['./publish'],
): string {
  // These are later evaluated with MSBuild, but are passed via --framework and --runtime arguments instead of -p:TargetFramework
  const publishProperties = [...MSBuildProject.MatrixProperties]

  return [
    formatDotnetPublish(projectsToPublish, publishProperties),
    formatDotnetPack(projectsToPackAndPush),
    formatDotnetNugetSign(dotnetNugetSignArgs),
  ].join(' && ')

  function formatDotnetPublish(projectsToPublish: string[], publishProperties: string[]): string {
    /* Fun Fact: You can define a property and get the evaluated value in the same command!
    ```pwsh
    dotnet msbuild .\src\HXE.csproj -property:RuntimeIdentifiers="""place;holder""" -getProperty:RuntimeIdentifiers
    place;holder
    ```
      enclosing with """ is required in pwsh to prevent the semicolon from breaking the string.
    */
    if (!Array.isArray(projectsToPublish) || projectsToPublish.length === 0)
      throw new Error(`Type of projectsToPublish (${typeof projectsToPublish}) is not allowed. Expected a string[] where length > 0.`)

    // each may have TargetFramework OR TargetFrameworks (plural)
    const evaluatedProjects: MSBuildProject[] = projectsToPublish.map(
      proj => new MSBuildProject(proj, publishProperties),
    )

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

  function formatDotnetPack(projectsToPackAndPush?: string[]): string {
    return !projectsToPackAndPush
      ? ''
      : projectsToPackAndPush
        .map(v => `dotnet pack ${v}`)
        .join(' && ')
  }

  /**
   * todo: finish basic functionality, refactor to allow complex configuration (per-package signing, per-package and per-registry signing)
   *
   * @param {string[]} dotnetNugetSignArgs
   * @returns {string}
   */
  function formatDotnetNugetSign(dotnetNugetSignArgs: string[]): string {
    switch (dotnetNugetSignArgs.length) {
      case 0:
        return ''
      default:
        return `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')}`
      // default: {
      //     throw new Error("")
      //     // this needs a rework.
      //     const packagePaths: string[] = [];
      //     dotnetNugetSignArgs.forEach((dotnetNugetSignArg, i) => {
      //         // if current arg doesn't start with '-' and (current arg is first -OR- previous arg also does not start with '-')...
      //         if (!dotnetNugetSignArg.startsWith("-") && (i === 0 || (i > 0 && !dotnetNugetSignArgs[i - 1].startsWith("-")))) {
      //             // ...then it's probably a package path.
      //             packagePaths.push(dotnetNugetSignArg);
      //         }
      //     });
      //     if (packagePaths.length === 0)
      //         return `dotnet nuget sign ${dotnetNugetSignArgs.join(" ")}`
      //     else return
      // }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NugetRegistryInfo } from './NugetRegistryInfo.js'

/**
 * A simple record-like class with optional 'user' property for user-password authentication.
 * Input of {@link configureDotnetNugetPush} and output of {@link NugetRegistryInfo.prototype.toRegistryPair}.
 */
export class NugetRegistryPair {
  public constructor(tokenEnvVar: string, url: string, user?: string) {
    this.tokenEnvVar = tokenEnvVar
    this.url = url
    this.user = user
  }

  public readonly tokenEnvVar: string
  public readonly url: string
  public readonly user?: string | undefined

  /**
   * convert this class to a `dotnet nuget push command`
   * @param packageOutputPath
   * @returns command
   */
  public toCommand(packageOutputPath: string): string {
    const tokenValue = getEnvVarValue(this.tokenEnvVar)
    ok(getEnvVarValue('SKIP_TOKEN') === 'true' || tokenValue, `The environment variable ${this.tokenEnvVar} is undefined!`)
    return `dotnet nuget push ${packageOutputPath} --source ${this.url} --token ${tokenValue ?? '**placeholder**'}`
  }
}
export const nugetDefault = new NugetRegistryPair('NUGET_TOKEN', 'https://api.nuget.org/v3/index.json')

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
