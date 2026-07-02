import { type, type Scope, type Type } from 'arktype';
import { warn } from 'node:console';
import { hash } from 'node:crypto';
import { type Dirent } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.ts';
import debug from '../debug.ts';
import { execAsync } from '../utils/execAsync.ts';
import { isError } from '../utils/isError.ts';
import { MSBuildProjectProperties } from './MSBuildProjectProperties.ts';
import {
  NPPGetterNames,
  NugetProjectProperties,
} from './NugetProjectProperties.ts';

const debug_MSBP = debug.extend('MSBuildProject');
debug_MSBP.enabled = debug.enabled;
const debug_MSBP_PPTMSBP = debug_MSBP.extend('PackableProjectsToMSBuildProjects');
debug_MSBP_PPTMSBP.enabled = debug.enabled;
const debug_MSBP_Evaluate = debug_MSBP.extend('Evaluate');
debug_MSBP_Evaluate.enabled = debug.enabled;

export type TemporaryDirectoryNamespace_Unix = `${ReturnType<typeof tmpdir>}/HCE.Shared/.NET/`;
export type TemporaryDirectoryNamespace_Win = `${ReturnType<typeof tmpdir>}\\HCE.Shared\\.NET\\`;
const temporaryDirectoryNamespace = path.join(tmpdir(), 'HCE.Shared', '.NET') as TemporaryDirectoryNamespace_Unix | TemporaryDirectoryNamespace_Win;

/**
 * See [MSBuild well-known item metadata](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-well-known-item-metadata).
 * Additional string-type properties may be present (e.g. `{ SubType: "designer" }`).
 */
const interface_ItemMetadataBuiltIn = type({
  '[string]': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\ConsoleApp1.dll" */
  Identity: 'string',
  /** @example "Designer" */
  'SubType?': 'string',
  /** @example ".NETCoreApp" */
  'TargetFrameworkIdentifier?': 'string',
  'TargetPlatformMoniker?': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\obj\\Debug\\net6.0\\ConsoleApp1.csproj.CopyComplete" */
  'CopyUpToDateMarker?': 'string',
  'TargetPlatformIdentifier?': 'string',
  /** @example "6.0" */
  'TargetFrameworkVersion?': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\obj\\Debug\\net6.0\\ref\\ConsoleApp1.dll" */
  'ReferenceAssembly?': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\ConsoleApp1.dll" */
  FullPath: 'string',
  /** @example "c:\\" */
  RootDir: 'string',
  /** @example "ConsoleApp1" */
  Filename: 'string',
  /** @example ".dll" */
  Extension: 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\" */
  RelativeDir: 'string',
  /** @example "source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\" */
  Directory: 'string',
  RecursiveDir: 'string',
  /** @example "2023-11-30 13:38:06.5084339" */
  ModifiedTime: 'string',
  /** @example "2023-11-30 13:38:06.9308716" */
  CreatedTime: 'string',
  /** @example "2023-11-30 13:38:06.9318732" */
  AccessedTime: 'string',
  /** @example "C:\\Program Files\\Microsoft Visual Studio\\2022\\Preview\\MSBuild\\Current\\Bin\\amd64\\Microsoft.Common.CurrentVersion.targets" */
  DefiningProjectFullPath: 'string',
  /** @example "C:\\Program Files\\Microsoft Visual Studio\\2022\\Preview\\MSBuild\\Current\\Bin\\amd64\\" */
  DefiningProjectDirectory: 'string',
  /** @example "Microsoft.Common.CurrentVersion" */
  DefiningProjectName: 'string',
  /** @example ".targets" */
  DefiningProjectExtension: 'string',
});

const targetSuccess = type({
  Result: '\'Success\'',
  Items: interface_ItemMetadataBuiltIn.array(),
});

const targetFailure = type({
  Result: '\'Failure\'',
  Items: 'never[]',
});

const msbuildEvaluationOutput: Type<{
  Properties?: Record<string, string> | undefined;
  Items?: Record<string, {
    [x: string]: string | undefined;
    Identity: string;
    FullPath: string;
    RootDir: string;
    Filename: string;
    Extension: string;
    RelativeDir: string;
    Directory: string;
    RecursiveDir: string;
    ModifiedTime: string;
    CreatedTime: string;
    AccessedTime: string;
    DefiningProjectFullPath: string;
    DefiningProjectDirectory: string;
    DefiningProjectName: string;
    DefiningProjectExtension: string;
    SubType?: string;
    TargetFrameworkIdentifier?: string | undefined;
    TargetPlatformMoniker?: string | undefined;
    CopyUpToDateMarker?: string | undefined;
    TargetPlatformIdentifier?: string | undefined;
    TargetFrameworkVersion?: string | undefined;
    ReferenceAssembly?: string | undefined;
  }[]> | undefined;
  TargetResults?: Record<string, {
    Result: 'Success';
    Items: {
      [x: string]: string | undefined;
      Identity: string;
      FullPath: string;
      RootDir: string;
      Filename: string;
      Extension: string;
      RelativeDir: string;
      Directory: string;
      RecursiveDir: string;
      ModifiedTime: string;
      CreatedTime: string;
      AccessedTime: string;
      DefiningProjectFullPath: string;
      DefiningProjectDirectory: string;
      DefiningProjectName: string;
      DefiningProjectExtension: string;
      SubType?: string | undefined;
      TargetFrameworkIdentifier?: string | undefined;
      TargetPlatformMoniker?: string | undefined;
      CopyUpToDateMarker?: string | undefined;
      TargetPlatformIdentifier?: string | undefined;
      TargetFrameworkVersion?: string | undefined;
      ReferenceAssembly?: string | undefined;
    }[];
  } | {
    Result: 'Failure';
    Items: never[];
  }> | undefined;
}> = type({
  'Properties?': type({ '[string]': 'string' }),
  'Items?': type({ '[string]': interface_ItemMetadataBuiltIn.array() }),
  'TargetResults?': type({ '[string]': targetSuccess.or(targetFailure) }),
});

export class MSBuildEvaluationOutput {
  /**
   * The specified properties and their values as evaluated by MSBuild Core.
   * `-getProperty:{propertyName,...}`
   */
  Properties?: typeof msbuildEvaluationOutput.infer.Properties;
  /**
   * The specified items and their values and associated metadata as evaluated
   * by MSBuild Core.
   * `-getItem:{itemName,...}`
   */
  Items?: typeof msbuildEvaluationOutput.infer.Items;
  /**
   * The specified Targets and their output values as evaluated by MSBuild
   * Core.
   * `-getTargetResult:{targetName,...}`
   */
  TargetResults?: typeof msbuildEvaluationOutput.infer.TargetResults;

  /**
   * @param rawMSBuildEvaluation The output of a CLI MSBuild project evaluation.
   * May be the UTF-8 string-encoded JSON or the object decoded from that JSON.
   */
  constructor(rawMSBuildEvaluation: Parameters<typeof JSON.parse>[0] | Parameters<typeof msbuildEvaluationOutput.from>[0]) {
    /** `.assert` instead of `.from` to allow `unknown` JSON.parse return type */
    const knownObject = msbuildEvaluationOutput.assert(typeof rawMSBuildEvaluation === 'string' ? JSON.parse(rawMSBuildEvaluation) : rawMSBuildEvaluation);

    this.Properties = knownObject.Properties;
    this.Items = knownObject.Items;
    this.TargetResults = knownObject.TargetResults;
  }
}

export const EvaluationOptions: Type<{
  FullName: string;
  /**
   * @see {@link NugetProjectProperties}
   * @description
   * User-defined Properties and their values.
   * `{ Configuration: "Release" }` will cause the MSBuild to first set the
   * Configuration property  to Release before evaluating the project
   * or the project's Target(s).
   * ```txt
   *   -property:<n>=<v>  Set or override these project-level properties. <n> is
   *                      the property name, and <v> is the property value. Use a
   *                      semicolon or a comma to separate multiple properties, or
   *                      specify each property separately. (Short form: -p)
   *                      Example:
   *                        -property:WarningLevel=2;OutDir=bin\Debug\
   * ```
   */
  Property: Partial<{ -readonly [P in keyof NugetProjectProperties]: NugetProjectProperties[P] }>;
  Targets: readonly string[] | string[];
  GetItem: readonly string[] | string[];
  GetProperty: readonly string[] | string[];
  GetTargetResult: readonly string[] | string[];
}> = Object.freeze(
  type({
    /**
     * The project file's full path.
     */
    FullName: 'string',
    /**
     * User-defined Properties and their values.
     * { Configuration: "Release" } will cause the MSBuild to first set the
     * Configuration property  to Release before evaluating the project
     * or the project's Target(s).
     * ```txt
     *   -property:<n>=<v>  Set or override these project-level properties. <n> is
     *                      the property name, and <v> is the property value. Use a
     *                      semicolon or a comma to separate multiple properties, or
     *                      specify each property separately. (Short form: -p)
     *                      Example:
     *                        -property:WarningLevel=2;OutDir=bin\Debug\
     * ```
     */
    Property: type({ '[string]': 'string' })
      .as<{ -readonly [P in keyof NugetProjectProperties]: NugetProjectProperties[P] }>()
      .partial(),
    /**
     * The MSBuild Targets to run for evaluation. ["Pack"] is recommended.
     * Property values may be changed by Targets such as those provided by
     * dependencies.
     *
     * ```txt
     *   -target:<targets>  Build these targets in this project. Use a semicolon or a
     *                      comma to separate multiple targets, or specify each
     *                      target separately. (Short form: -t)
     *                      Example:
     *                        -target:Resources;Compile
     * ```
     * @default []
     */
    Targets: type.string.array().readonly().or('string[]'),
    /**
     * MSBuild Items to evaluate. `["Compile"]` will result in the MSBuild output
     * including {@link MSBuild}
     */
    GetItem: type.string.array().readonly().or('string[]'),
    GetProperty: type.string.array().readonly().or('string[]'),
    GetTargetResult: type.string.array().readonly().or('string[]'),
  }),
);

export class MSBuildProject {
  /**
   * Properties for multi-targeting `dotnet publish` outputs.
   * These are included in {@link NPPGetterNames.InstanceGettersRecursive}.
   */
  public static readonly MatrixProperties: readonly string[] = Object.freeze([
    'TargetFramework',
    'TargetFrameworks',
    'RuntimeIdentifier',
    'RuntimeIdentifiers',
  ]);

  /**
   * @param projectPath The full path of the project file or its directory. A
   * relative path may be passed, but will resolve relative to the current
   * working directory.
   * @param includeNonPublic Include conventionally internal/private MSBuild
   * targets in the result.
   * @returns A string array of the project's MSBuild targets.
   * @todo consider 'file' of -targets[:file]
   *  Prints a list of available targets without executing the
   *  actual build process. By default the output is written to
   *  the console window. If the path to an output file
   *  is provided that will be used instead.
   *  (Short form: -ts)
   *  Example:
   *    -ts:out.txt
   */
  static async GetTargets(
    projectPath: string,
    // eslint-disable-next-line unicorn/consistent-boolean-name
    includeNonPublic = false,
  ): Promise<string[]> {
    const stdPair = await execAsync(`dotnet msbuild ${projectPath} -targets`, true);

    const targets = stdPair.stdout
      .split('\n')
      .filter((v, index) => v !== '' && index !== 0)
      .map(v => v.replaceAll('\r', ''))
      .sort((a, b) => a.localeCompare(b));
    return includeNonPublic
      ? targets
      : targets.filter(v => !v.startsWith('_'));
  }

  /**
   * Evaluate {@link Items}, {@link Properties}, and {@link TargetResults},
   * returning them as an instance of {@link MSBuildProject}.\
   * Note: MSBuild will probably fail if Restore is skipped and another
   * target is specified. If you choose Pack, you must do ['Restore', 'Pack'].
   * @param options The result of {@link EvaluationOptions.from}.
   * @returns A promised {@link MSBuildProject} instance.
   * @throws {Error} if the exec command fails -OR- the JSON parse fails -OR-
   * MSBuildProject's constructor fails.
   * @see {@link PackableProjectsToMSBuildProjects} for most use-cases.
   */
  public static async Evaluate(
    options: typeof EvaluationOptions.inferOut,
  ): Promise<MSBuildProject> {
    if (
      options.GetProperty.length === 0
      && options.GetItem.length === 0
      && options.GetTargetResult.length === 0
    ) {
      throw new Error(
        'No MSBuild Property, Item, or TargetResult queries were provided.',
      );
    }
    // We append this to IntermediateOutputPath for parallel evaluations
    const shortHashName = `options_SHA3-256_${
      hash(
        'SHA3-256',
        JSON.stringify(options),
      ).slice(0, 7)
    }`;
    const debug_MSBP_Evaluate_hashed = debug_MSBP_Evaluate.extend(shortHashName);
    debug_MSBP_Evaluate_hashed.enabled = debug.enabled;
    options.Property.BaseIntermediateOutputPath = path.join(
      temporaryDirectoryNamespace,
      path.basename(options.FullName, path.extname(options.FullName)),
      shortHashName,
      'obj',
    ) + '/';
    options.Property.BaseOutputPath = path.join(
      temporaryDirectoryNamespace,
      path.basename(options.FullName, path.extname(options.FullName)),
      shortHashName,
      'bin',
    ) + '/';

    // reminder: args containing spaces and semi-colons MUST be quote-enclosed!
    options.FullName = MSBuildProjectProperties.GetFullPath(options.FullName);
    // disable GeneratePackageOnBuild so Pack can succeed when Build hasn't been run
    options.Property.GeneratePackageOnBuild = 'false';
    const _pairs = Object.entries<string>(options.Property).filter(p => typeof p[1] === 'string') as [['BaseIntermediatePath', '0'], ['BaseOutputPath', '1'], ['GeneratePackageOnBuild', 'false'], ...[string, string][]];
    const string_target
      = options.Targets.length === 0
        ? ''
        : `"-t:${options.Targets.join(';')}"`;
    const string_getItem
      = options.GetItem.length === 0
        ? ''
        : `"-getItem:${options.GetItem.join(',')}"`;
    const string_getProperty
      = options.GetProperty.length === 0
        ? ''
        : `"-getProperty:${options.GetProperty.join(',')}"`;
    const string_getTargetResult
      = options.GetTargetResult.length === 0
        ? ''
        : `"-getTargetResult:${options.GetTargetResult.join(',')}"`;
    const string_property_array: string[]
      = _pairs.map(([key, value]) => `"-p:${key}=${value}"`);

    const isTargetPack = string_target.toLocaleLowerCase().replaceAll('"', '') == `-t:pack`;
    const commandLine = [
      'dotnet',
      isTargetPack ? 'pack' : 'msbuild',
      `"${options.FullName}"`,
      '-restore',
      isTargetPack ? '' : string_target,
      string_getItem,
      string_getProperty,
      string_getTargetResult,
      ...string_property_array,
    ]
      .filter(v => v !== '')
      .join(' ');
    const output = await loopTryDotnetCommand({
      commandLine,
      customDebugger: debug_MSBP_Evaluate_hashed,
      projectName: path.basename(options.FullName, path.extname(options.FullName)),
      taskVerb: 'evaluate',
      timeoutMilliseconds: 360_000,
    });

    // todo: consider -getResultOutputFile:file
    //  Redirect output from get* into a file.
    //
    //  Example:
    //  -getProperty:Bar -getResultOutputFile:Biz.txt
    //  This writes the value of property Bar into Biz.txt.

    /**
     * The following issues have triggered this code path:
     * - BaseIntermediateOutputPath must use Unix path separators ('/') on all
     *   platforms. Even Windows. Otherwise, MSBuild/dotnet will error-exit with
     *   "The BaseIntermediateOutputPath must end with a trailing slash".
     */
    if (output.stdout.startsWith('MSBuild version')) {
      warn(output.stdout);
      throw new Error(
        'dotnet msbuild was expected to output JSON, but output its version header instead.',
      );
    }

    let rawOutput: ConstructorParameters<typeof MSBuildEvaluationOutput>[0];
    if (output.stdout.startsWith('{')) {
      /** stdout is JSON string */
      rawOutput = output.stdout;
    }
    else if (options.GetProperty.length > 0 && options.GetProperty[0] !== undefined) {
      rawOutput = {
        Properties: {
          [options.GetProperty[0]]: String(JSON.parse(output.stdout)),
        },
      };
    }
    else {
      throw new Error('Dotnet/MSBuild evaluation output is not a string nor JSON object or array.');
    }

    const evaluation = new MSBuildEvaluationOutput(rawOutput);

    debug_MSBP_Evaluate_hashed(`Getting MSBuild Targets of "${options.FullName}"...`);
    const projTargets = await this.GetTargets(options.FullName);

    debug_MSBP_Evaluate_hashed(`Returning new MSBuildProject instance for "${options.FullName}"...`);
    return new MSBuildProject({
      fullPath: options.FullName,
      projTargets,
      evaluation,
    });
  }

  /**
   * Evaluate multiple project paths with some default Evaluate options.
   * @async
   * @param projectsToPackAndPush An array of MSBuild projects' full file
   * paths. If a path is a directory, files in that directory are filtered for
   * `.csproj`, `.fsproj`, and `.vbproj` project files.
   * See https://github.com/dotnet/sdk/blob/497f334b2862bdf98b30c00ede2fd259ea5f624d/src/Cli/dotnet/Commands/New/MSBuildEvaluation/MSBuildEvaluationResult.cs#L19-L32.\
   * @returns A promised array of {@link MSBuildProject} instances.
   * All known MSBuild and NuGet properties are evaluated.
   * If applicable, a project's "Pack" target is evaluated.
   */
  public static async PackableProjectsToMSBuildProjects(
    projectsToPackAndPush: string[],
  ): Promise<Promise<MSBuildProject>[]> {
    debug_MSBP_PPTMSBP('Mapping projects to Dirent instances...');
    const directoryEntriesPromise = await toDirectoryEntries(typeof projectsToPackAndPush === 'string' ? [projectsToPackAndPush] : projectsToPackAndPush);
    debug_MSBP_PPTMSBP('Converting Dirent instances to MSBuildProject instances...');
    const projectPromises: Promise<MSBuildProject>[] = directoryEntriesPromise.map(element => convertDirentToMSBuildProject(element));
    return projectPromises;

    /**
     * Map an array of filesystem paths to {@link Dirent} instances representing project files.
     * @param projectsToPackAndPush An array of MSBuild projects' full file
     * paths. If a path is a directory, files in that directory are filtered for
     * `.csproj`, `.fsproj`, and `.vbproj` project files. See
     * https://github.com/dotnet/sdk/blob/497f334b2862bdf98b30c00ede2fd259ea5f624d/src/Cli/dotnet/Commands/New/MSBuildEvaluation/MSBuildEvaluationResult.cs#L19-L32.\
     * @returns An promised array of Dirent instances for discovered project files.
     */
    async function toDirectoryEntries(
      projectsToPackAndPush: string[],
    ): Promise<Dirent[]> {
      const directoryEntries: (Dirent | Dirent[])[] = await Promise.all(
        projectsToPackAndPush.map(async (proj) => {
          debug_MSBP_PPTMSBP(`Getting absolute path of "${proj}"...`);
          proj = await realpath(makeAbsolute(proj));

          debug_MSBP_PPTMSBP(`Getting filesystem stats of "${proj}"...`);
          const stats = await stat(proj);
          let entries: Dirent[];

          if (stats.isFile()) {
            debug_MSBP_PPTMSBP(`"${proj}" is a file. Returning Dirent instance...`);
            entries = await readdir(path.dirname(proj), { withFileTypes: true });
            const dirent: Dirent | undefined = entries.find(v =>
              path.join(
                // condition required for compatibility. `.path` was deprecated, but `.parentPath` is not available in our node minversion
                ('path' in v ? v.path as string | undefined : undefined) ?? (v as unknown as Omit<typeof v, 'path'> & { parentPath: string }).parentPath,
                v.name,
              ) === proj,
            );
            if (dirent)
              return dirent;
            throw new Error(
              `file "${proj}" not found. It may have been moved or deleted.`,
            );
          }
          if (!stats.isDirectory())
            throw new Error(`"${proj}" is not a file or directory`);

          debug_MSBP_PPTMSBP(`"${proj}" is a directory. Searching for files ending with ".csproj", ".fsproj", or ".vbproj"...`);
          entries = await readdir(proj, { withFileTypes: true });
          return entries.filter(v =>
            v.isFile()
            && (v.name.endsWith('.csproj') || v.name.endsWith('.fsproj') || v.name.endsWith('.vbproj')),
          );
        }),
      );

      return directoryEntries.flat();
    }

    /**
     * Map a {@link Dirent} instance to an {@link MSBuildProject} instance.
     * @param dirent A {@link Dirent} instance. This instance should be an MSBuild project file.
     * @returns An instance of {@link MSBuildProject} evaluated with the `Pack` target result, if applicable. Evaluated properties will be those whose names are returned by {@link NPPGetterNames.InstanceGettersRecursive}.
     */
    async function convertDirentToMSBuildProject(dirent: Dirent): Promise<MSBuildProject> {
      const fullPath = path.join(
        // condition required for compatibility. `.path` was deprecated, but `.parentPath` is not available in our node minversion
        ('path' in dirent ? dirent.path as string | undefined : undefined) ?? (dirent as unknown as Omit<typeof dirent, 'path'> & { parentPath: string }).parentPath,
        dirent.name,
      );

      debug_MSBP_PPTMSBP(`Getting MSBuild targets of "${fullPath}"...`);
      const projTargets: string[] = await MSBuildProject.GetTargets(fullPath);
      const evalTargets: string[] = projTargets.includes('Pack') ? ['Pack'] : [];
      // this might be too long for a command line. What was it on Windows?
      // 2^15 (32,768) character limit for command lines?
      const propertiesToEvaluate = NPPGetterNames.InstanceGettersRecursive;
      const withTargets: string = evalTargets.length === 0
        ? ''
        : ` with target(s) ${evalTargets.join(', ').replace(/, ([^,]+)$/, ', and ${0}')}`;

      debug_MSBP_PPTMSBP(`Evaluating "${fullPath}" for properties${withTargets}...`);
      return await MSBuildProject.Evaluate(
        EvaluationOptions.from({
          FullName: fullPath,
          GetItem: [],
          GetProperty: propertiesToEvaluate,
          GetTargetResult: [],
          Property: {},
          Targets: evalTargets,
        }),
      );
    }
  }

  public static fromJSON(json: string): MSBuildProject {
    const parsed = T_PseudoMSBPInstance.assert(JSON.parse(json));

    type.true.assert(
      Reflect.setPrototypeOf(parsed, this.prototype),
    );
    type.true.assert(
      Reflect.setPrototypeOf(parsed.Properties, NugetProjectProperties.prototype),
    );
    parsed.Properties = T_NPP.assert(parsed.Properties);
    return T_MSBuildProject.assert(parsed);
  }

  readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
  readonly Properties: Readonly<NugetProjectProperties>;
  readonly Targets: readonly string[];
  /**
   * Allows appending subsequent target results.
   */
  readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];

  /**
   * Creates an instance of MSBuildProject.
   * @param opts The order-independent arguments for this constructor.
   * Properties may be added or moved around in this definition without
   * breaking compatibility.
   * @param opts.fullPath The full path of the MSBuild project's file. This
   * should have a '.csproj', '.fsproj', or '.vbproj' file extension.
   * @param opts.projTargets A list of MSBuild Targets supported by the project.
   * @param opts.evaluation The output of an MSBuild project evaluation. This
   * comprises MSBuild Properties, Items, and Target results.
   */
  // eslint-disable-next-line unicorn/name-replacements
  public constructor(opts: {
    fullPath: string;
    projTargets: string[];
    evaluation: MSBuildEvaluationOutput;
  }) {
    this.Items = opts.evaluation.Items ?? {};
    this.Properties = new NugetProjectProperties(
      opts.fullPath,
      new CaseInsensitiveMap<string, string>(
        Object.entries(opts.evaluation.Properties ?? {}),
      ),
    );
    this.Targets = opts.projTargets;
    this.TargetResults
      = opts.evaluation.TargetResults === undefined
        ? []
        : [opts.evaluation.TargetResults];
  }
}

const T_MSBuildProject = type.instanceOf(MSBuildProject);
const T_NPP = type.instanceOf(NugetProjectProperties);
const T_PseudoMSBPInstance = type({
  Items: type({
    '[string]': type({
      '[string]': 'string',
      Identity: 'string',
      FullPath: 'string',
      RootDir: 'string',
      Filename: 'string',
      Extension: 'string',
      RelativeDir: 'string',
      Directory: 'string',
      RecursiveDir: 'string',
      ModifiedTime: 'string',
      CreatedTime: 'string',
      AccessedTime: 'string',
      DefiningProjectFullPath: 'string',
      DefiningProjectDirectory: 'string',
      DefiningProjectName: 'string',
      DefiningProjectExtension: 'string',
      'SubType?': ' string | undefined',
      'TargetFrameworkIdentifier?': 'string | undefined',
      'TargetPlatformMoniker?': 'string | undefined',
      'CopyUpToDateMarker?': 'string | undefined',
      'TargetPlatformIdentifier?': 'string | undefined',
      'TargetFrameworkVersion?': 'string | undefined',
      'ReferenceAssembly?': 'string | undefined',
    }).array(),
  }),
  Properties: type.Record('string', 'string').or(T_NPP),
  Targets: type.string.array(),
  TargetResults: msbuildEvaluationOutput.get('TargetResults').exclude('undefined').array(),

});

/**
 * ArkType type definitions for internal usage, but may be re-used elsewhere
 * @internal
 */
export const _InternalMSBuildEvaluationTypes: Scope<{
  msbuildEvaluationOutput: {
    Properties?: Record<string, string> | undefined;
    Items?: Record<string, {
      [x: string]: string | undefined;
      Identity: string;
      FullPath: string;
      RootDir: string;
      Filename: string;
      Extension: string;
      RelativeDir: string;
      Directory: string;
      RecursiveDir: string;
      ModifiedTime: string;
      CreatedTime: string;
      AccessedTime: string;
      DefiningProjectFullPath: string;
      DefiningProjectDirectory: string;
      DefiningProjectName: string;
      DefiningProjectExtension: string;
      SubType?: string | undefined;
      TargetFrameworkIdentifier?: string | undefined;
      TargetPlatformMoniker?: string | undefined;
      CopyUpToDateMarker?: string | undefined;
      TargetPlatformIdentifier?: string | undefined;
      TargetFrameworkVersion?: string | undefined;
      ReferenceAssembly?: string | undefined;
    }[]> | undefined;
    TargetResults?: Record<string, {
      Result: 'Success';
      Items: {
        [x: string]: string | undefined;
        Identity: string;
        FullPath: string;
        RootDir: string;
        Filename: string;
        Extension: string;
        RelativeDir: string;
        Directory: string;
        RecursiveDir: string;
        ModifiedTime: string;
        CreatedTime: string;
        AccessedTime: string;
        DefiningProjectFullPath: string;
        DefiningProjectDirectory: string;
        DefiningProjectName: string;
        DefiningProjectExtension: string;
        SubType?: string | undefined;
        TargetFrameworkIdentifier?: string | undefined;
        TargetPlatformMoniker?: string | undefined;
        CopyUpToDateMarker?: string | undefined;
        TargetPlatformIdentifier?: string | undefined;
        TargetFrameworkVersion?: string | undefined;
        ReferenceAssembly?: string | undefined;
      }[];
    } | {
      Result: 'Failure';
      Items: never[];
    }> | undefined;
  };
}> = type.scope({
  msbuildEvaluationOutput,
});

/**
 * Resolve a path if it is not already absolute.
 * @param _path A filesystem path.
 * @returns A full path to a filesystem entry. The path is unchecked for whether or not the path (or its parts) exist.
 */
function makeAbsolute(_path: string) {
  return path.isAbsolute(_path) ? _path : path.resolve(_path);
}

/**
 * Use this in your catch statement or .catch call to return `undefined` when
 * a "file in use by another process" (i.e. EBUSY/ERROR_SHARING_VIOLATION) error is reported.
 * @param error Probably an Error object
 * @returns `undefined` if file in use by another process
 */
// TODO: BREAKING CHANGE: change return type to `true` to lint implicit `undefined`/`void` returns.
export function catchEBUSY(error: unknown): undefined {
  if (isError(error)) {
    if ('stderr' in error && typeof error.stderr === 'string') {
      // Normalize colon-like chars: '\uFF1A'.normalize('NFKC') === ':' === true;
      const normalizedStderr = error.stderr.normalize('NFKC');
      const patternEN = /The process cannot access the file '[^']+' because it is being used by another process\./gm;
      const hasErrorMessagePattern = patternEN.test(normalizedStderr);
      const isCS2012 = /^CSC ?:.+CS2012:/gm.test(normalizedStderr);
      // generic error code; error message must be checked.
      const isAVLN9999 = /AVLN9999:/gm.test(normalizedStderr)
        && hasErrorMessagePattern;
      if (isCS2012 || isAVLN9999 || hasErrorMessagePattern)
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined; /* retry */
      throw error;
    }
    /**
     * some known warnings/errors:
     * - warning MSB3073:
     *   The command "dotnet tool list kuinox.nupkgdeterministicator"
     *   exited with code 145.
     *    > $ dotnet tool list kuinox.nupkgdeterministicator
     *    > The command could not be loaded, possibly because:
     *    >   * You intended to execute a .NET application:
     *    >       The application 'tool' does not exist.
     *    >   * You intended to execute a .NET SDK command:
     *    >       No .NET SDKs were found.
     *    >
     *    > Download a .NET SDK:
     *    > https://aka.ms/dotnet/download
     *    >
     *    > Learn about SDK resolution:
     *    > https://aka.ms/dotnet/sdk-not-found
     */
    throw error;
  }
  throw new Error('unknown error', { cause: error });
}

/**
 *
 * Use this in your catch statement or .catch call to return `undefined` when
 * MSBuild error CSC2012 (e.g. "file in use by another process") is reported.
 * @param error Probably an Error object
 * @returns `undefined` if CSC2012 (file in use by another process) occurs
 * @deprecated Use {@link catchEBUSY}.
 */
export function catchCsc2012(error: unknown): undefined {
  if (isError(error)) {
    // check for error reported when "file in use by another process" i.e. EBUSY
    // (UNIX), NTSTATUS.ERROR_SHARING_VIOLATION == 0x20 == 32 (Windows)
    if ('stderr' in error && typeof error.stderr === 'string'
      && /^CSC ?:.+CS2012:/gm.test(
        // '\uFF1A'.normalize('NFKC') === ':' === true;
        error.stderr.normalize('NFKC'),
      )
    ) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined; /* retry */
    }
    /**
     * some known warnings/errors:
     * - warning MSB3073:
     *   The command "dotnet tool list kuinox.nupkgdeterministicator"
     *   exited with code 145.
     *    > $ dotnet tool list kuinox.nupkgdeterministicator
     *    > The command could not be loaded, possibly because:
     *    >   * You intended to execute a .NET application:
     *    >       The application 'tool' does not exist.
     *    >   * You intended to execute a .NET SDK command:
     *    >       No .NET SDKs were found.
     *    >
     *    > Download a .NET SDK:
     *    > https://aka.ms/dotnet/download
     *    >
     *    > Learn about SDK resolution:
     *    > https://aka.ms/dotnet/sdk-not-found
     */
    throw error;
  }
  throw new Error('unknown error', { cause: error });
}

/**
 *
 * @returns A Promise of execAsync's output object.
 * @param root0 structured parameters object
 * @param root0.commandLine The command line to try and retry
 * @param root0.taskVerb Used in debug messages e.g. ```
 * const debug_MSBP = debug.extend('MSBuildProject');
 * debug_MSBP.enabled = debug.enabled;
 * const output = await loopTryDotnetCommand({ customDebugger: debug_MSBP, ... });
 * ```
 * @param root0.customDebugger e.g. `debug.extend('Evaluate)`
 * @param root0.projectName The filename (sans extension) or AssemblyName of the project e.g. `path.basename(fullPath, path.extname(fullPath))`
 * @param root0.timeoutMilliseconds The maximum time spent (re)trying the command.
 * Warning! {@link totalMilliseconds} may be significantly greater than {@link timeoutMilliseconds}!
 * e.g.
 * `325_000 <=300_000` (5m25s vs 5m)
 * `378_000 <=360_000` (6m18s vs 6m),
 * `630_000 <=600_000` (10m30s vs 10m)
 * `1225_000 <=1200_000` (20m25s vs 20m)
 * `2415_000 <=2400_000` (40m15s vs 40m)
 * `2556_000 <=2485_000` (42m36s vs 41m25s; 71 seconds over)
 * @throws {Error} when retry limit is reached or an unhandled exception occurs.
 * File-in-use errors are _supposed_ to be ignored and retried.
 */
export async function loopTryDotnetCommand({ commandLine, customDebugger, projectName, taskVerb, timeoutMilliseconds: maximumTime }: {
  commandLine: string;
  customDebugger: typeof debug;
  projectName: string;
  taskVerb?: string | undefined;
  timeoutMilliseconds: number;
}): Promise<Awaited<ReturnType<typeof execAsync>>> {
  let output: Awaited<ReturnType<typeof execAsync>> | undefined;
  let totalMilliseconds = 0;
  let delay = 0;

  taskVerb ??= '<undefined>';
  customDebugger(`Beginning try/retry loop to ${taskVerb} "${projectName}"...`);

  while (output === undefined) {
    try {
      await setTimeout(delay, undefined);
      output = await execAsync(commandLine, true);
    }
    catch (error: unknown) {
      if (totalMilliseconds > maximumTime /* milliseconds */) {
        throw new Error(
          `Unable to ${taskVerb} "${projectName}": Retry limit hit. ~${(totalMilliseconds / 1000).toString()} seconds spent retrying.`,
          { cause: error },
        );
      };
      catchEBUSY(error);
      // incremental back-off; add new delay to total
      totalMilliseconds += delay += 1000;
      customDebugger(`A file needed by "${projectName}" is locked by another process. Retrying after ${(delay / 1000).toString()} seconds...`);
    }
  };
  return output;
}
