import { MSBuildProject } from './MSBuildProject.js';
import { NugetRegistryInfo } from './NugetRegistryInfo.js';
import { MSBuildProjectProperties as MSBPP } from './MSBuildProjectProperties.js';
import { listOwnGetters } from '../utils/reflection.js';
import { NugetProjectProperties as NPP } from './NugetProjectProperties.js';
import { cwd } from 'process';

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
 *  Relative and/or full file paths of projects to pass to `dotnet pack`. If
 *  string[], only the default NuGet Source will be used. If GitHub, GitLab,
 *  etc. are also desired, pass {@link NugetRegistryInfo}[]
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
  const evaluatedProjects: MSBuildProject[] = [];

  // append evaluated projects
  projectsToPublish
    .filter(p => p instanceof MSBuildProject)
    .forEach(p => evaluatedProjects.push(p));
  projectsToPackAndPush
    ?.filter(p => p instanceof NugetRegistryInfo)
    .forEach(p => evaluatedProjects.push(p.project));

  return [
    await formatDotnetPublish(
      projectsToPublish,
      MSBuildProject.MatrixProperties,
    ),
    await formatDotnetPack(projectsToPackAndPush ?? []),
    formatDotnetNugetSign(dotnetNugetSignArgs),
    // remove no-op commands
  ]
    .filter(v => v !== undefined)
    .join(' && ');

  async function formatDotnetPublish(
    projectsToPublish: string[] | MSBuildProject[],
    publishProperties: readonly string[] | string[],
  ): Promise<string> {
    /* Fun Fact: You can define a property and get the evaluated value in the same command!
    ```pwsh
    dotnet msbuild .\src\HXE.csproj -property:RuntimeIdentifiers="""place;holder""" -getProperty:RuntimeIdentifiers
    place;holder
    ```
      enclosing with """ is required in pwsh to prevent the semicolon from breaking the string.
    */
    if (!Array.isArray(projectsToPublish) || projectsToPublish.length === 0)
      throw new Error(
        `Type of projectsToPublish (${typeof projectsToPublish}) is not allowed. Expected a string[] or MSBuildProject[] where length > 0.`,
      );

    // each may have TargetFramework OR TargetFrameworks (plural)
    const evaluatedPublishProjects: MSBuildProject[] = await Promise.all(
      projectsToPublish.map(async (proj): Promise<MSBuildProject> => {
        if (proj instanceof MSBuildProject)
          return proj;

        // filter for projects whose full paths match the full path of the given string
        const filteredProjects = evaluatedProjects.filter(p =>
          p.Properties.MSBuildProjectFullPath === MSBPP.GetFullPath(proj),
        );

        // if no pre-existing MSBuildProject found, evaluate a new one and push
        // it
        if (filteredProjects.length === 0) {
          const _proj = await MSBuildProject.Evaluate({
            FullName: proj,
            GetProperty: publishProperties,
            GetItem: [],
            GetTargetResult: [],
            Property: {},
            Targets: ['Restore'],
          });
          evaluatedProjects.push(_proj);
          return _proj;
        }

        /*
        todo: improve filtering to select "optimal" instance.
          Which properties are most-needed?
          For now, we just pray the project has a well-defined publish flow e.g.
          @halospv3/hce.shared-config/dotnet/PublishAll.targets
         */
        return filteredProjects[0];
      }),
    );

    /** convert evaluatedPublishProjects to...strings? */
    const converted = await Promise.all(
      evaluatedPublishProjects.flatMap(async (proj: MSBuildProject): Promise<string[]> => {
        // If the project imports PublishAll to publish for each TFM-RID
        // permutation, return the appropriate command line.
        if (proj.Targets.includes('PublishAll'))
          return [`${proj.Properties.MSBuildProjectFullPath} -t:PublishAll`];

        // #region formatFrameworksAndRuntimes
        const tfmRidPermutations: string[] = []; // forEach, run dotnet [proj.Properties.MSBuildProjectFullPath,...v]
        const RIDs: string[] = proj.Properties.RuntimeIdentifiers.split(';');
        const TFMs: string[] = proj.Properties.TargetFrameworks.split(';');
        /*
         * const spaceStr = ' '
         * const splitEmpty = emptyStr.split(';')
         * console.log(splitEmpty)
         * // Expected output: Array [" "]
         */

        if (TFMs.length === 0 && RIDs.length === 0)
          return [proj.Properties.MSBuildProjectFullPath]; // return string[]

        if (RIDs.length !== 0) {
          if (TFMs.length !== 0) {
            for (const RID of RIDs) {
              for (const TFM of TFMs) {
                tfmRidPermutations.push(`--runtime ${RID} --framework ${TFM}`);
              }
            }
          }
          else {
            // assume singular TFM. No need to specify it.
            for (const RID of RIDs) {
              tfmRidPermutations.push(`--runtime ${RID}`);
            }
          }
        }
        else if (TFMs.length !== 0) {
          for (const TFM of TFMs) {
            tfmRidPermutations.push(`--framework ${TFM}`);
          }
        }

        return tfmRidPermutations.map((permArgs: string): string =>
          [proj.Properties.MSBuildProjectFullPath, permArgs].join(' '),
        );
      }),
    );

    return converted.map((args: string[]): string =>
      `dotnet publish ${args.join(' ')}`,
    ).join(' && ');
  }

  /**
   * @param projectsToPackAndPush a string[] or {@link NugetRegistryInfo}[].
   * If a string[], the string must be the platform-dependent (not file://),
   * full path(s) to one or more projects with the .NET "Pack" MSBuild target.
   * See {@link https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-pack}
   * for command line usage.
   * @returns one or more command line strings joined with ' && '.
   * Each command line comprises the `dotnet pack` command, a project file path,
   * and a hardcoded output path (`--output ${cwd()}/publish`)
   * todo: get "namespaced output" pack command from the NugetRegistryInfo[]
   * todo: require projectsToPackAndPush, never return undefined
   */
  async function formatDotnetPack(
    projectsToPackAndPush: string[] | NugetRegistryInfo[],
  ): Promise<string | undefined> {
    if (projectsToPackAndPush.length === 0)
      return undefined;
    return await Promise.all(
      projectsToPackAndPush.map(async (proj) => {
        if (proj instanceof NugetRegistryInfo)
          return proj;

        const msbp = await MSBuildProject.Evaluate({
          FullName: proj,
          GetItem: [],
          GetProperty: [
            ...MSBuildProject.MatrixProperties,
            ...listOwnGetters(MSBPP.prototype),
            ...listOwnGetters(NPP.prototype),
          ],
          GetTargetResult: [],
          Property: {},
          Targets: ['Restore', 'Pack'],
        });

        evaluatedProjects.push(msbp);

        return new NugetRegistryInfo({ project: msbp });
      }),
    ).then((nriArray: NugetRegistryInfo[]): string => {
      return nriArray
        .map((nri: NugetRegistryInfo): string =>
          nri.GetPackCommand(NugetRegistryInfo.PackPackagesOptionsType.from({})),
        ).join(' && ');
    });
  }

  /**
   * @param {string[]} dotnetNugetSignArgs
   * arguments to append to 'dotnet nuget sign ', joined with spaces.
   * @returns {string} `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `
   */
  function formatDotnetNugetSign(
    dotnetNugetSignArgs?: string[],
  ): string | undefined {
    if (!dotnetNugetSignArgs || dotnetNugetSignArgs.length === 0)
      return undefined;
    return `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `;
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
 * todo: reorder parameters so registryInfos is first. Optional parameters should always follow required parameters.
 * todo: split into separate functions. Token verification should be in verifyConditionsCmd. Each package may be signed individually.
 * TODO: completely rewrite
 * @param packageOutputPath
 * @param registryInfos
 * @param pushToGitHub
 * @returns
 */
export async function configureDotnetNugetPush(
  registryInfos: NugetRegistryInfo[],
  packageOutputPath = `${cwd()}/publish`,
): Promise<string> {
  if (registryInfos.some(registry => registry.url.trim() === ''))
    throw new Error('The URL for one of the provided NuGet registries was empty or whitespace.');

  return registryInfos
    .map((nri): string =>
      nri.GetPackCommand(
        NugetRegistryInfo.PackPackagesOptionsType.from({ output: packageOutputPath }),
        false,
        false,
      ),
    )
    .join(' && ');
}
