/* eslint-disable unicorn/prevent-abbreviations */
import { MSBuildProject } from './MSBuildProject.js';
import { NugetRegistryInfo } from './NugetRegistryInfo.js';
import { MSBuildProjectProperties as MSBPP } from './MSBuildProjectProperties.js';
import { cwd } from 'node:process';

/**
 * Build a prepareCmd string from .NET projects.\
 * This will include a `dotnet publish` for each project's RID and TFM permutation,\
 * `dotnet pack` for each project with output paths separated by NuGet Source and PackageId,\
 * and `dotnet nuget sign` for each nupkg output directory.
 *
 * todo: parse Solution files to publish all projects with default Publish parameters (as evaluated by MSBuild).
 * todo: cleanup, docs
 * todo: change to instance method of SemanticReleaseConfigDotnet
 * @param projectsToPublish An array of relative or full file paths of `.csproj`
 * projects  -OR- an array of {@link MSBuildProject} objects.
 * The project paths will be passed to `dotnet publish` commands.
 * @param projectsToPackAndPush
 *  Relative and/or full file paths of projects to pass to `dotnet pack`. If
 *  string[], only the default NuGet Source will be used. If GitHub, GitLab,
 *  etc. are also desired, pass {@link NugetRegistryInfo}[]
 * @param [dotnetNugetSignArgs]
 * Default: `['./publish]`\
 * Arguments appended to `dotnet nuget sign`. You may append an arbitrary
 * command by splitting it into arguments e.g.
 * [..., '&& dotnet nuget sign your/package/path --certificate-path your/cert/path']
 * This can be used to sign a package with a different key. In fact, any
 * arbitrary command may be added here.
 * @returns A single string of CLI commands joined by ' && '
 */
export async function configurePrepareCmd(
  projectsToPublish: string[] | MSBuildProject[],
  projectsToPackAndPush?: string[] | NugetRegistryInfo[],
  dotnetNugetSignArgs: string[] | ['./publish'] = ['./publish'],
): Promise<string> {
  const evaluatedProjects: MSBuildProject[] = [];

  // append evaluated projects
  for (const p of projectsToPublish.filter(p => p instanceof MSBuildProject)) {
    evaluatedProjects.push(p);
  }
  if (projectsToPackAndPush) {
    for (const p of projectsToPackAndPush.filter(p => p instanceof NugetRegistryInfo)) {
      evaluatedProjects.push(p.project);
    }
  }

  return [
    await formatDotnetPublish(projectsToPublish),
    await formatDotnetPack(projectsToPackAndPush ?? []),
    formatDotnetNugetSign(dotnetNugetSignArgs),
    // remove no-op commands
  ]
    .filter(v => v !== undefined)
    .join(' && ');

  /**
   * Create a string of CLI commands to run `dotnet publish` or the Publish
   * MSBuild target for one or more projects.
   * @async
   * @param projectsToPublish An array of one or more projects, either
   * pre-evaluated (see {@link MSBuildProject.Evaluate}) or as full file paths.\
   * NOTE: Although `dotnet publish` allows directory or Solution file (.sln,
   * .slnx) paths, this function expects projects' full or relative file
   * paths.
   * @returns A Promise of a string. This string contains one or more `dotnet publish`
   * commands conjoined by " && ". It may also include one or more
   * `dotnet msbuild ${...} -t:PublishAll` commands.
   */
  async function formatDotnetPublish(
    projectsToPublish: string[] | MSBuildProject[],
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

        // if no pre-existing MSBuildProject found,
        // evaluate a new one and push it
        if (filteredProjects.length === 0) {
          const _proj = await MSBuildProject.Evaluate({
            FullName: proj,
            GetProperty: MSBuildProject.MatrixProperties,
            GetItem: [],
            GetTargetResult: [],
            Property: {},
            Targets: ['Restore'],
          });
          evaluatedProjects.push(_proj);
          return _proj;
        }

        /**
         * Finds and returns the subjectively "best" project in {@link filteredProjects}
         * @returns the subjective "best" project in {@link filteredProjects}
         */
        function getBest() {
          let best: MSBuildProject | undefined;
          if (filteredProjects.length > 0 && (best = filteredProjects[0]) instanceof MSBuildProject)
            return best;
          throw new Error('No MSBuildProjects could be found!');
        }

        /*
        todo: improve filtering to select "optimal" instance.
          Which properties are most-needed?
          For now, we just pray the project has a well-defined publish flow e.g.
          @halospv3/hce.shared-config/dotnet/PublishAll.targets
         */
        return getBest();
      }),
    );

    /** @return e.g. `['--runtime win7-x86 --framework net6.0', '--runtime win7-x64 --framework net6.0' ]` */
    function getPublishArgsPermutations(proj: MSBuildProject): string[] {
      /**
       * If the project imports PublishAll to publish for each TFM-RID
       * permutation, return the appropriate command line.
       */
      if (proj.Targets.includes('PublishAll'))
        return [`${proj.Properties.MSBuildProjectFullPath} -t:PublishAll`];

      // #region formatFrameworksAndRuntimes
      const tfmRidPermutations: string[] = []; // forEach, run dotnet [proj.Properties.MSBuildProjectFullPath,...v]
      const RIDs: string[] = proj.Properties.RuntimeIdentifiers.split(';');
      const TFMs: string[] = proj.Properties.TargetFrameworks.split(';');

      if (TFMs.length === 0 && RIDs.length === 0)
        return [proj.Properties.MSBuildProjectFullPath]; // return string[]

      if (RIDs.length > 0) {
        if (TFMs.length > 0) {
          for (const RID of RIDs) {
            for (const TFM of TFMs) {
              tfmRidPermutations.push(
                `--runtime ${RID} --framework ${TFM}`,
              );
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

      /** prepend each set of args with the project's path */
      return tfmRidPermutations.map((permArgs: string): string =>
        `${proj.Properties.MSBuildProjectFullPath} ${permArgs}`,
      );
      // #endregion formatFrameworksAndRuntimes
    }

    /** convert evaluatedPublishProjects to sets of space-separated CLI args. */
    const argsSets: string[] = evaluatedPublishProjects.flatMap(proj => getPublishArgsPermutations(proj));

    // For each argSet, create a new exec command. Then, join all commands with ' && ' so they are executed serially, synchronously.
    // e.g. `dotnet publish project.csproj --runtime win7-x86 --framework net6.0 && dotnet publish project.csproj --runtime win-x64 --framework net8.0
    return argsSets
      .map((argsSet: string): string => `dotnet publish ${argsSet}`)
      .join(' && ');
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

        const msbpArr: MSBuildProject[] = await MSBuildProject.PackableProjectsToMSBuildProjects([proj]);
        if (msbpArr.length === 0 || msbpArr[0] === undefined) {
          throw new Error('This should be impossible!');
        }
        const msbp: MSBuildProject = msbpArr[0];

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
}

/**
 * Prepare the CLI command to push NuGet packages. This should added to the `publishCmd` option of `@semantic-release/exec`
 *
 * Ensure your verifyConditionsCmd is set to prevent releases failing due to bad tokens or packages!
 * See {@link NugetRegistryInfo#PackDummyPackage}, {@link NugetRegistryInfo#GetPushDummyCommand}
 * @param registryInfos an array of {@link NugetRegistryInfo} (or derived classes) instances.
 * @param packageOutputPath Default: `${cwd()}/publish`.\
 * The directory at which dotnet outputs the given projects' packages. Passed to
 * `dotnet pack` via the `--output` argument.
 * @returns a string of `dotnet pack` and `dotnet push` commands, joined by ' && '.
 */
export function configureDotnetNugetPush(
  registryInfos: NugetRegistryInfo[],
  packageOutputPath = `${cwd()}/publish`,
): string {
  if (registryInfos.some(registry => registry.url.trim() === ''))
    throw new Error('The URL for one of the provided NuGet registries was empty or whitespace.');

  const packCmds = registryInfos.map(
    (nri): string =>
      nri.GetPackCommand(
        { output: packageOutputPath },
        true,
        true,
      ),
  );

  const pushCmds = registryInfos.map(nri => nri.GetPushCommand({ root: packageOutputPath }, true, true));

  return [...packCmds, ...pushCmds].join(' && ');
}

/**
 * @param dotnetNugetSignArgs arguments to append to 'dotnet nuget sign ', joined with spaces.
 * @returns `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `
 */
function formatDotnetNugetSign(
  dotnetNugetSignArgs?: string[],
): string | undefined {
  if (!dotnetNugetSignArgs || dotnetNugetSignArgs.length === 0)
    return undefined;
  return `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')} `;
}
