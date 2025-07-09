import { type } from 'arktype';
import { warn } from 'node:console';
import { type Dirent } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js';
import { ChildProcessSpawnException, execAsync } from '../utils/execAsync.js';
import { MSBuildProjectProperties } from './MSBuildProjectProperties.js';
import {
  NPPGetterNames,
  NugetProjectProperties,
} from './NugetProjectProperties.js';

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

const msbuildEvaluationOutput = type({
  'Properties?': type({ '[string]': 'string' }),
  'Items?': type({ '[string]': interface_ItemMetadataBuiltIn.array() }),
  'TargetResults?': type({ '[string]': targetSuccess.or(targetFailure) }),
});

export class MSBuildEvaluationOutput {
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
}

export const EvaluationOptions = Object.freeze(
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
      .as<{ -readonly [P in keyof MSBuildProjectProperties]: MSBuildProjectProperties[P] }>()
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

  readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
  readonly Properties: Readonly<NugetProjectProperties>;
  readonly Targets: readonly string[];
  /**
   * Allows appending subsequent target results.
   */
  readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];

  static async GetTargets(
    projectPath: string,
    includeNonPublic = false,
  ): Promise<string[]> {
    return execAsync(`dotnet msbuild ${projectPath} -targets`, true)
      .then((v) => {
        const targets = v.stdout
          .split('\n')
          .filter((v, index) => v !== '' && index !== 0)
          .map(v => v.replace('\r', ''))
          .sort((a, b) => a.localeCompare(b));
        return includeNonPublic
          ? targets
          : targets.filter(v => !v.startsWith('_'));
      });
  }

  /**
   * Evaluate {@link Items}, {@link Properties}, and {@link TargetResults},
   * returning them as an instance of {@link MSBuildProject}.\
   * Note: MSBuild will probably fail if Restore is skipped and another
   * target is specified. If you choose Pack, you must do ['Restore', 'Pack'].
   * @param options The result of {@link EvaluationOptions.from}.
   * @returns A promised {@link MSBuildProject} instance.
   * @throws if the exec command fails -OR- the JSON parse fails -OR-
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
    // reminder: args containing spaces and semi-colons MUST be quote-enclosed!
    options.FullName = MSBuildProjectProperties.GetFullPath(options.FullName);
    const _pairs = Object.entries(options.Property).filter(p => typeof p[1] === 'string');
    const property
      = _pairs.length === 0
        ? ''
        : `"-p:${_pairs.map(pair => pair[0] + '=' + pair[1]).join(';')}"`;
    const target
      = options.Targets.length === 0 ? '' : `"-t:${options.Targets.join(';')}"`;
    const getItem
      = options.GetItem.length === 0
        ? ''
        : `"-getItem:${options.GetItem.join(',')}"`;
    const getProperty
      = options.GetProperty.length === 0
        ? ''
        : `"-getProperty:${options.GetProperty.join(',')}"`;
    const getTargetResult
      = options.GetTargetResult.length === 0
        ? ''
        : `"-getTargetResult:${options.GetTargetResult.join(',')}"`;
    const cmdLine = [
      'dotnet',
      'msbuild',
      `"${options.FullName}"`,
      property,
      target,
      getItem,
      getProperty,
      getTargetResult,
    ]
      .filter(v => v !== '')
      .join(' ');
    // may throw
    const stdio: Awaited<ReturnType<typeof execAsync>> = await execAsync(cmdLine, true)
      .catch(async (error: unknown) => {
        if (error instanceof ChildProcessSpawnException) {
          let _stdio: Awaited<ReturnType<typeof execAsync>> | undefined;
          // todo: locale-agnostic. Is the exit code reliable?
          while (_stdio === undefined) {
            await setTimeout(
              10,
              async () => {
                try {
                  _stdio = await execAsync(cmdLine, true);
                }
                catch (error) {
                  if (error instanceof ChildProcessSpawnException && error.stderr?.includes('because it is being used by another process')) {
                    return;
                  }
                };
              },
            ).then(async (v) => { await v(); });
          }
          return _stdio;
        }
        else throw error;
      });

    if (stdio.stdout.startsWith('MSBuild version')) {
      warn(stdio.stdout);
      throw new Error(
        'dotnet msbuild was expected to output JSON, but output its version header instead.',
      );
    }

    let rawOutput = undefined;
    if (stdio.stdout.startsWith('{')) {
      /** stdout is JSON string */
      rawOutput = stdio.stdout;
    }
    else if (options.GetProperty.length > 0 && options.GetProperty[0] !== undefined) {
      rawOutput = {
        Properties: {
          [options.GetProperty[0]]: String(JSON.parse(stdio.stdout)),
        },
      };
    }
    else {
      throw new Error('Dotnet/MSBuild evaluation output is not a string nor JSON object or array.');
    }

    const evaluation = new MSBuildEvaluationOutput(rawOutput);

    return new MSBuildProject({
      fullPath: options.FullName,
      projTargets: await MSBuildProject.GetTargets(options.FullName),
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
    const dirEntriesPromise = toDirEntries(typeof projectsToPackAndPush === 'string' ? [projectsToPackAndPush] : projectsToPackAndPush);
    const projectPromises: Promise<MSBuildProject>[] = await dirEntriesPromise
      .then(
        (direntArray: Dirent[]) =>
          direntArray.map(element => convertDirentToMSBuildProject(element)),
      );
    return projectPromises;

    /**
     * Map an array of filesystem paths to {@link Dirent} instances representing project files.
     * @param projectsToPackAndPush An array of MSBuild projects' full file
     * paths. If a path is a directory, files in that directory are filtered for
     * `.csproj`, `.fsproj`, and `.vbproj` project files. See
     * https://github.com/dotnet/sdk/blob/497f334b2862bdf98b30c00ede2fd259ea5f624d/src/Cli/dotnet/Commands/New/MSBuildEvaluation/MSBuildEvaluationResult.cs#L19-L32.\
     * @returns An promised array of Dirent instances for discovered project files.
     */
    async function toDirEntries(
      projectsToPackAndPush: string[],
    ): Promise<Dirent[]> {
      const dirEntries: (Dirent | Dirent[])[] = await Promise.all(
        projectsToPackAndPush.map(async (proj) => {
          proj = await realpath(makeAbsolute(proj));
          const stats = await stat(proj);
          let entries: Dirent[];

          if (stats.isFile()) {
            entries = await readdir(path.dirname(proj), { withFileTypes: true });
            const dirent: Dirent | undefined = entries.find(v =>
              path.resolve(v.parentPath, v.name) === proj,
            );
            if (dirent)
              return dirent;
            else
              throw new Error(
                `file "${proj}" not found. It may have been moved or deleted.`,
              );
          }
          if (!stats.isDirectory())
            throw new Error(`"${proj}" is not a file or directory`);

          entries = await readdir(proj, { withFileTypes: true });
          return entries.filter(v =>
            v.isFile()
            && (v.name.endsWith('.csproj') || v.name.endsWith('.fsproj') || v.name.endsWith('.vbproj')),
          );
        }),
      );

      return dirEntries.flat();
    }

    /**
     * Map a {@link Dirent} instance to an {@link MSBuildProject} instance.
     * @param dirent A {@link Dirent} instance. This instance should be an MSBuild project file.
     * @returns An instance of {@link MSBuildProject} evaluated with the `Pack` target result, if applicable. Evaluated properties will be those whose names are returned by {@link NPPGetterNames.InstanceGettersRecursive}.
     */
    async function convertDirentToMSBuildProject(dirent: Dirent): Promise<MSBuildProject> {
      const fullPath = path.resolve(dirent.parentPath, dirent.name);
      const projTargets: Promise<string[]> = MSBuildProject.GetTargets(fullPath);
      const evalTargets = await projTargets.then(v =>
        v.includes('Pack') ? ['Pack'] : [],
      );
      // this might be too long for a command line. What was it on Windows?
      // 2^15 (32,768) character limit for command lines?
      const getProperties = NPPGetterNames.InstanceGettersRecursive;

      return await MSBuildProject.Evaluate(
        EvaluationOptions.from({
          FullName: fullPath,
          GetItem: [],
          GetProperty: getProperties,
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
      Reflect.setPrototypeOf(parsed, MSBuildProject.prototype),
    );
    type.true.assert(
      Reflect.setPrototypeOf(parsed.Properties, NugetProjectProperties.prototype),
    );
    parsed.Properties = T_NPP.assert(parsed.Properties);
    return T_MSBuildProject.assert(parsed);
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

/** ArkType type definitions for internal usage, but may be re-used elsewhere */
export const _InternalMSBuildEvaluationTypes = type.scope({
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
