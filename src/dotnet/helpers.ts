import { type } from 'arktype';
import path from 'node:path';
import { cwd } from 'node:process';
import { MSBuildProject } from './MSBuildProject.js';
import { MSBuildProjectProperties as MSBPP } from './MSBuildProjectProperties.js';
import { NugetRegistryInfo } from './NugetRegistryInfo.js';
import type { Default } from 'arktype/internal/attributes.ts';
import type { ObjectType } from 'arktype/internal/methods/object.ts';

const ourDefaultPubDir = path.join('.', 'publish') as `.${'/' | '\\'}publish`;

/**
 * Build a prepareCmd string from .NET projects.\
 * This will include a `dotnet publish` for each project's RID and TFM permutation,\
 * `dotnet pack` for each project with output paths separated by NuGet Source and PackageId,\
 * and `dotnet nuget sign` for each nupkg output directory.
 * @todo parse Solution files to publish all projects with default Publish parameters (as evaluated by MSBuild).
 * @param projectsToPublish An array of relative or full file paths of `.csproj`
 * projects  -OR- an array of {@link MSBuildProject} objects.
 * The project paths will be passed to `dotnet publish` commands.
 * @param projectsToPackAndPush
 *  Relative and/or full file paths of projects to pass to `dotnet pack`. If
 *  string[], only the default NuGet Source will be used. If GitHub, GitLab,
 *  etc. are also desired, pass {@link NugetRegistryInfo}[]
 * @param dotnetNugetSignOpts A {@link DotnetNugetSignOptions} object. The value
 * of the `--output` argument will be set to {@link ourDefaultPubDir} if `undefined`.
 * @returns A single string of CLI commands joined by ' && '
 */
export async function configurePrepareCmd(
  projectsToPublish: string[] | MSBuildProject[],
  projectsToPackAndPush?: string[] | NugetRegistryInfo[],
  dotnetNugetSignOpts?: typeof DotnetNugetSignOptions.inferIn,
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

  const dotnetPublishCmd: string = await formatDotnetPublish(projectsToPublish);
  const dotnetPackCmd: string | undefined = await formatDotnetPack(projectsToPackAndPush ?? []);
  const dotnetNugetSignCmd: string | undefined = formatDotnetNugetSign(dotnetNugetSignOpts);

  return [
    dotnetPublishCmd,
    dotnetPackCmd,
    dotnetNugetSignCmd,
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
    if (!Array.isArray(projectsToPublish) || projectsToPublish.length === 0) {
      throw new Error(
        `Type of projectsToPublish (${typeof projectsToPublish}) is not allowed. Expected a string[] or MSBuildProject[] where length > 0.`,
      );
    }

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

    /**
     * Returns an array of one or more `dotnet` arguments.
     * @param proj An {@link MSBuildProject} to be published for one or more
     * runtime-framework combinations.
     * @returns If {@link proj} imports {@link ../../dotnet/PublishAll.targets}...
     * ```
     * [`${proj.Properties.MSBuildProjectFullPath} -t:PublishAll`]
     * ```
     * Else, an array of `dotnet publish` arguments permutations e.g.
     * ```
     * [
     *   'myProj.csproj --runtime win7-x86 --framework net6.0',
     *   'myProj.csproj --runtime win7-x64 --framework net6.0'
     * ]
     * ```
     * @example
     * const publishCmdArray = [];
     * const permutations = getPublishArgsPermutations(msbuildProject);
     * for (const permutation of permutations) {
     *   if (permutation[0] === 'PublishAll') {
     *     // 'dotnet msbuild full/path/to/myProj.csproj t:PublishAll'
     *     publishCmdArray.push(`dotnet msbuild ${permutation[1]}`)
     *   }
     *   else {
     *     publishCmdArray.push(`dotnet publish ${permutation}`)
     *   }
     * }
     * // return array as success-chained CLI commands.
     * return publishCmdArray.join(' && ');
     */
    function getPublishArgsPermutations(proj: MSBuildProject):
      ([`"${typeof proj.Properties.MSBuildProjectFullPath}" -t:PublishAll`])
      | ([`"${typeof proj.Properties.MSBuildProjectFullPath}"`])
      | (`"${typeof proj.Properties.MSBuildProjectFullPath}" --runtime ${string} --framework ${string}`)[]
      | (`"${typeof proj.Properties.MSBuildProjectFullPath}" --runtime ${string}`)[]
      | (`"${typeof proj.Properties.MSBuildProjectFullPath}" --framework ${string}`)[] {
      /**
       * If the project imports PublishAll to publish for each TFM-RID
       * permutation, return the appropriate command line.
       */
      if (proj.Targets.includes('PublishAll'))
        return [`"${proj.Properties.MSBuildProjectFullPath}" -t:PublishAll`];

      // #region formatFrameworksAndRuntimes
      const tfmRidPermutations: `--runtime ${string} --framework ${string}`[]
        | `--runtime ${string}`[]
        | `--framework ${string}`[]
        = []; // forEach, run dotnet [proj.Properties.MSBuildProjectFullPath,...v]
      const RIDs: string[] = proj.Properties.RuntimeIdentifiers.split(';').filter(v => v !== '');
      const TFMs: string[] = proj.Properties.TargetFrameworks.split(';').filter(v => v !== '');

      if (TFMs.length === 0 && RIDs.length === 0)
        return [`"${proj.Properties.MSBuildProjectFullPath}"`] as [`"${string}"`];

      if (RIDs.length > 0) {
        if (TFMs.length > 0) {
          for (const RID of RIDs) {
            for (const TFM of TFMs) {
              (tfmRidPermutations as `--runtime ${string} --framework ${string}`[]).push(
                `--runtime ${RID} --framework ${TFM}`,
              );
            }
          }
        }
        else {
          // assume singular TFM. No need to specify it.
          for (const RID of RIDs) {
            (tfmRidPermutations as `--runtime ${string}`[]).push(
              `--runtime ${RID}`,
            );
          }
        }
      }
      else if (TFMs.length > 0) {
        for (const TFM of TFMs) {
          (tfmRidPermutations as `--framework ${string}`[]).push(`--framework ${TFM}`);
        }
      }

      /** prepend each set of args with the project's path */
      return tfmRidPermutations.map(permArgs =>
        `"${proj.Properties.MSBuildProjectFullPath}" ${permArgs}`,
      ) as `"${typeof proj.Properties.MSBuildProjectFullPath}" --runtime ${string} --framework ${string}`[]
      | `"${typeof proj.Properties.MSBuildProjectFullPath}" --runtime ${string}`[]
      | `"${typeof proj.Properties.MSBuildProjectFullPath}" --framework ${string}`[];
      // #endregion formatFrameworksAndRuntimes
    }

    const publishCmds: (`dotnet publish "${string}"` | `dotnet publish "${string}" ${string}` | `dotnet msbuild "${string}" -t:PublishAll`)[] = [];
    /** convert {@link evaluatedPublishProjects} to sets of space-separated CLI args. */
    const argsSets = evaluatedPublishProjects.map(
      proj => getPublishArgsPermutations(proj),
    );
    for (const args of argsSets) {
      if (typeof args === 'string')
        throw new Error(`\`args\` should not be a string!`);
      for (const permutation of args) {
        if (typeof permutation === 'string' && permutation.length === 1)
          throw new Error('Something has gone terribly wrong. A `dotnet publish` argument set was split to single characters!');
        publishCmds.push(`dotnet publish ${permutation}`);
      }
    }

    // For each argSet, create a new exec command. Then, join all commands with ' && ' so they are executed serially, synchronously.
    // e.g. `dotnet publish project.csproj --runtime win7-x86 --framework net6.0 && dotnet publish project.csproj --runtime win-x64 --framework net8.0
    return publishCmds.join(' && ');
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

        const msbpArr: MSBuildProject[] = await Promise.all(await MSBuildProject.PackableProjectsToMSBuildProjects([proj]));
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
  // Explicit type required by JSR
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  packageOutputPath: string = `${cwd()}/publish`,
): string {
  if (registryInfos.some(registry => registry.source.trim() === ''))
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
 * You should try {@link ../../dotnet/SignAfterPack.targets}!.
 * @param opts A {@link DotnetNugetSignOptions} object to be deconstructed and
 * passed to `dotnet nuget sign` as args.
 * @returns `dotnet nuget sign {...}`
 */
function formatDotnetNugetSign(
  opts: typeof DotnetNugetSignOptions.inferIn | undefined,
): string | undefined {
  if (opts === undefined)
    return undefined;

  const validOpts = DotnetNugetSignOptions.from(opts);
  const args: ['--timestamper', typeof validOpts.timestamper, '-o', string, ...string[]] = [
    '--timestamper', validOpts.timestamper,
    '-o', validOpts.output ?? ourDefaultPubDir,
  ];
  if (validOpts.certificatePassword)
    args.push('---certificate-password', validOpts.certificatePassword);
  if (validOpts.hashAlgorithm)
    args.push('--hash-algorithm', validOpts.hashAlgorithm);
  if (validOpts.overwrite)
    args.push('--overwrite');
  if (validOpts.timestampHashAlgorithm)
    args.push('--timestamp-hash-algorithm', validOpts.timestampHashAlgorithm);
  if (validOpts.verbosity)
    args.push('-v', validOpts.verbosity);

  if ('certificatePath' in validOpts)
    args.push('--certificate-path', validOpts.certificatePath);
  else if ('certificateStoreName' in validOpts) {
    SetSubjectNameOrFingerprint();
    args.push('--certificate-store-name', validOpts.certificateStoreName);
  }
  else if ('certificateStoreLocation' in validOpts) {
    SetSubjectNameOrFingerprint();
    args.push('--certificate-store-location', validOpts.certificateStoreLocation);
  }
  else throw new Error('No code signing certificate was specified!');

  return `dotnet nuget sign ${args.join(' ')} `;

  // eslint-disable-next-line jsdoc/require-jsdoc
  function SetSubjectNameOrFingerprint() {
    if ('certificateSubjectName' in validOpts)
      args.push('--certificate-subject-name', validOpts.certificateSubjectName);

    else if ('certificateFingerprint' in validOpts)
      args.push('--certificate-fingerprint', validOpts.certificateFingerprint);
    else throw new Error('If certificateStoreName or certificateStoreLocation is set, either certificateSubjectName or certificateFingerprint must also be set!');
  }
}

const DotnetNugetSignOptions: ObjectType<
  {
    timestamper: Default<string, 'https://rfc3161.ai.moda/'>;
    certificatePassword?: string | undefined;
    hashAlgorithm?: string | undefined;
    output?: string | undefined;
    overwrite?: true | undefined;
    timestampHashAlgorithm?: string | undefined;
    verbosity?: 'q' | 'quiet' | 'm' | 'minimal' | 'n' | 'normal' | 'd' | 'detailed' | 'diag' | 'diagnostic';
  } & ({
    certificatePath: string;
    certificateSubjectName: string;
  } | {
    certificatePath: string;
    certificateFingerprint: string;
  } | {
    certificateStoreName: string;
    certificateSubjectName: string;
  } | {
    certificateStoreName: string;
    certificateFingerprint: string;
  } | {
    certificateStoreLocation: string;
    certificateSubjectName: string;
  } | {
    certificateStoreLocation: string;
    certificateFingerprint: string;
  })> = type({
  /**
   * Password for the certificate, if needed. This option can be used to specify
   * the password for the certificate. The command will throw an error message
   * if certificate is password protected but password is not provided as input.
   */
    'certificatePassword?': 'string',
    /**
     * Hash algorithm to be used to sign the package. Defaults to SHA256.
     */
    'hashAlgorithm?': 'string | "SHA256"',
    /**
     * Directory where the signed package(s) should be saved. By default the
     * original package is overwritten by the signed package.
     */
    'output?': 'string',
    /**
     * Switch to indicate if the current signature should be overwritten. By
     * default the command will fail if the package already has a signature.
     */
    'overwrite?': 'true',
    /**
     * URL to an RFC 3161 timestamping server.
     */
    timestamper: 'string = "https://rfc3161.ai.moda/"',
    /**
     * Hash algorithm to be used to sign the package. Defaults to SHA256.
     */
    'timestampHashAlgorithm?': 'string | "SHA256"',
    /**
     * Set the verbosity level of the command. Allowed values are q[uiet],
     * m[inimal], n[ormal], d[etailed], and diag[nostic].
     */
    'verbosity?': '"q"|"quiet"|"m"|"minimal"|"n"|"normal"|"d"|"detailed"|"diag"|"diagnostic"',
  }).and(
    type({
    /**
     * File path to the certificate to be used while signing the package.
     */
      certificatePath: 'string',
    }).or(
      type({
      /**
       * Name of the X.509 certificate store to use to search for the
       * certificate. Defaults to "My", the X.509 certificate store for personal
       * certificates.
       *
       * This option should be used when specifying the certificate via
       * --certificate-subject-name or --certificate-fingerprint options.
       */
        certificateStoreName: 'string',
      }).or({
      /**
       * Name of the X.509 certificate store use to search for the
       * certificate. Defaults to "CurrentUser", the X.509 certificate store
       * used by the current user.
       *
       * This option should be used when specifying the certificate via
       * --certificate-subject-name or --certificate-fingerprint options.
       */
        certificateStoreLocation: 'string',
      }),
    ).and(
      type({
      /**
       * Subject name of the certificate used to search a local certificate
       * store for the certificate. The search is a case-insensitive string
       * comparison using the supplied value, which will find all certificates
       * with the subject name containing that string, regardless of other
       * subject values. The certificate store can be specified by
       * --certificate-store-name and --certificate-store-location options.
       */
        certificateSubjectName: 'string',
      }).or({
      /**
       * SHA-256, SHA-384 or SHA-512 fingerprint of the certificate used to
       * search a local certificate store for the certificate. The certificate
       * store can be specified by --certificate-store-name and
       * --certificate-store-location options.
       */
        certificateFingerprint: 'string',
      }),
    ),
  );
