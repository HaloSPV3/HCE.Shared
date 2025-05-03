import { type } from 'arktype';
import { warn } from 'node:console';
import { type Dirent } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js';
import { execAsync } from '../utils/execAsync.js';
import { MSBuildProjectProperties } from './MSBuildProjectProperties.js';
import {
  GetNPPGetterNames,
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

class MSBuildEvaluationOutput {
  /**
   * @param knownObj The output of a CLI MSBuild project evaluation. May be the
   * UTF-8 string-encoded JSON or the object decoded from that JSON.
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

export class EvaluationOptions {
  // todo: wait for https://github.com/arktypeio/arktype/issues/808. Then, refactor from fluent notation to readable string-notation
  static readonly t = Object.freeze(
    type({
      FullName: 'string',
      Property: type.instanceOf(MSBuildProjectProperties).partial()
        .as<{ -readonly [P in keyof MSBuildProjectProperties]: MSBuildProjectProperties[P] }>()
        .and({ '[string]': 'string' }),
      Targets: type.string.array().readonly().or('string[]'),
      GetItem: type.string.array().readonly().or('string[]'),
      GetProperty: type.string.array().readonly().or('string[]'),
      GetTargetResult: type.string.array().readonly().or('string[]'),
    }),
  );

  constructor(options: typeof EvaluationOptions.t.infer) {
    options = EvaluationOptions.t.from(options);
    this.FullName = options.FullName;
    this.Property = options.Property;
    this.GetItem = options.GetItem;
    this.GetProperty = options.GetProperty;
    this.Targets = options.Targets;
    this.GetTargetResult = options.GetTargetResult;
  }

  /**
   * The project file's full path.
   */
  FullName: string;
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
  Property: Readonly<Record<string, string>> | Record<string, string>;
  /**
   * MSBuild Items to evaluate. `["Compile"]` will result in the MSBuild output
   * including {@link MSBuild}
   */
  GetItem: readonly string[] | string[];
  GetProperty: readonly string[] | string[];
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
   *
   * @default []
   */
  Targets: readonly string[] | string[] = [];
  GetTargetResult: readonly string[] | string[];
}

export class MSBuildProject {
  /**
   * Properties for multi-targeting `dotnet publish` outputs. These are included in {@link import('./NugetProjectProperties.ts').GetNPPGetterNames} when param `recurse` is `true`
   */
  public static readonly MatrixProperties: readonly string[] = Object.freeze([
    'TargetFramework',
    'TargetFrameworks',
    'RuntimeIdentifier',
    'RuntimeIdentifiers',
  ]);

  /**
   * Creates an instance of MSBuildProject.
   * @param {object} opts The order-independent arguments for this constructor.
   * Properties may be added or moved around in this definition without
   * breaking compatibility.
   * @param {string} opts.fullPath
   */
  public constructor(options: {
    fullPath: string;
    projTargets: string[];
    evaluation: MSBuildEvaluationOutput;
  }) {
    this.Items = options.evaluation.Items ?? {};
    this.Properties = new NugetProjectProperties(
      options.fullPath,
      new CaseInsensitiveMap<string, string>(
        Object.entries(options.evaluation.Properties ?? {}),
      ),
    );
    this.Targets = options.projTargets;
    this.TargetResults
      = options.evaluation.TargetResults === undefined
        ? []
        : [options.evaluation.TargetResults];
  }

  readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
  readonly Properties: Readonly<NugetProjectProperties>;
  readonly Targets: readonly string[];
  /**
   * @remarks Allows appending subsequent target results.
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
          .sort();
        return includeNonPublic
          ? targets
          : targets.filter(v => !v.startsWith('_'));
      });
  }

  /**
   * Evaluate {@link Items}, {@link Properties}, and {@link TargetResults},
   * returning them as an instance of {@link MSBuildProject}.\
   * @remarks MSBuild will probably fail if Restore is skipped and another
   * target is specified. If you choose Pack, you must do ['Restore', 'Pack'].
   * @throws if the exec command fails -OR- the JSON parse fails -OR-
   * MSBuildProject's constructor fails.
   * @see Consider calling {@link PackableProjectsToMSBuildProjects}, instead.
   */
  public static async Evaluate(
    options: EvaluationOptions,
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
    const _pairs = Object.entries(options.Property);
    const property
      = _pairs.length === 0
        ? ''
        : `"-p:${_pairs.map(pair => `${pair[0]}=${pair[1]}`).join(';')}"`;
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
    const stdio = await execAsync(cmdLine, true);
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
   *
   * @public
   * @static
   * @async
   * @param {string[]} projectsToPackAndPush
   * @returns {Promise<MSBuildProject[]>}
   * @todo consider returning Promise<MSBuildProject>[] so callers can `await MSBP.PackableProjectsToMSBuildProjects(projPaths).then(projPromises => projPromises.map(p => ...))`. This is more difficult to maintain, but can have slightly greater performance.
   */
  public static async PackableProjectsToMSBuildProjects(
    projectsToPackAndPush: string[],
  ): Promise<MSBuildProject[]> {
    const dirEntriesPromise = toDirEntries(typeof projectsToPackAndPush === 'string' ? [projectsToPackAndPush] : projectsToPackAndPush);
    const projectPromises: Promise<MSBuildProject>[] = await dirEntriesPromise.then((direntArray: Dirent[]) => direntArray.map(element => convertDirentToMSBuildProject(element)));
    const projects: Promise<MSBuildProject[]> = Promise.all(projectPromises);
    return projects;

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
            && (v.name.endsWith('.csproj') || v.name.endsWith('.fsproj')),
          );
        }),
      );

      return dirEntries.flat();
    }

    async function convertDirentToMSBuildProject(dirent: Dirent): Promise<MSBuildProject> {
      const fullPath = path.resolve(dirent.parentPath, dirent.name);
      const projTargets: Promise<string[]> = MSBuildProject.GetTargets(fullPath);
      const evalTargets = await projTargets.then(v =>
        v.includes('Pack') ? ['Pack'] : [],
      );
      // this might be too long for a command line. What was it on Windows?
      // 2^15 (32,768) character limit for command lines?
      const getProperties = GetNPPGetterNames(true, true);

      return await MSBuildProject.Evaluate(
        new EvaluationOptions({
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
}

function makeAbsolute(_path: string) {
  return path.isAbsolute(_path) ? _path : path.resolve(_path);
}
