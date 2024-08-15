import { type } from 'arktype'
import { exec } from 'node:child_process'
import { type Dirent } from 'node:fs'
import { readdir, realpath, stat } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js'
import { getOwnPropertyDescriptors } from '../utils/reflection.js'
import { MSBuildProjectProperties } from './MSBuildProjectProperties.js'
import { NugetProjectProperties } from './NugetProjectProperties.js'

const execAsync = promisify(exec)

/**
 * See [MSBuild well-known item metadata](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-well-known-item-metadata).
 * Additional string-type properties may be present (e.g. `{ SubType: "designer" }`).
 */
const iItemMetadataBuiltIn = type({
  '[string]': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\ConsoleApp1.dll" */
  'Identity': 'string',
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
  'FullPath': 'string',
  /** @example "c:\\" */
  'RootDir': 'string',
  /** @example "ConsoleApp1" */
  'Filename': 'string',
  /** @example ".dll" */
  'Extension': 'string',
  /** @example "c:\\source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\" */
  'RelativeDir': 'string',
  /** @example "source\\repos\\ConsoleApp1\\ConsoleApp1\\bin\\Debug\\net6.0\\" */
  'Directory': 'string',
  'RecursiveDir': 'string',
  /** @example "2023-11-30 13:38:06.5084339" */
  'ModifiedTime': 'string',
  /** @example "2023-11-30 13:38:06.9308716" */
  'CreatedTime': 'string',
  /** @example "2023-11-30 13:38:06.9318732" */
  'AccessedTime': 'string',
  /** @example "C:\\Program Files\\Microsoft Visual Studio\\2022\\Preview\\MSBuild\\Current\\Bin\\amd64\\Microsoft.Common.CurrentVersion.targets" */
  'DefiningProjectFullPath': 'string',
  /** @example "C:\\Program Files\\Microsoft Visual Studio\\2022\\Preview\\MSBuild\\Current\\Bin\\amd64\\" */
  'DefiningProjectDirectory': 'string',
  /** @example "Microsoft.Common.CurrentVersion" */
  'DefiningProjectName': 'string',
  /** @example ".targets" */
  'DefiningProjectExtension': 'string',
})

const targetSuccess = type({
  Result: '\'Success\'',
  Items: iItemMetadataBuiltIn.array(),
})

const targetFailure = type({
  Result: '\'Failure\'',
  Items: 'never[]',
})

const msbuildEvaluationOutput = type({
  'Properties?': type({ '[string]': 'string' }),
  'Items?': type({ '[string]': iItemMetadataBuiltIn.array() }),
  'TargetResults?': type({ '[string]': targetSuccess.or(targetFailure) }),
})

class MSBuildEvaluationOutput {
  /**
   * @param knownObj The output of a CLI MSBuild project evaluation. May be the
   * UTF-8 string-encoded JSON or the object decoded from that JSON.
   */
  constructor(obj: string | unknown) {
    if (typeof obj === 'string')
      obj = JSON.parse(obj)
    const knownObj = msbuildEvaluationOutput.assert(obj)

    this.Properties = knownObj.Properties
    this.Items = knownObj.Items
    this.TargetResults = knownObj.TargetResults
  }

  /**
   * The specified properties and their values as evaluated by MSBuild Core.
   * `-getProperty:{propertyName,...}`
   */
  Properties?: typeof msbuildEvaluationOutput.infer.Properties
  /**
   * The specified items and their values and associated metadata as evaluated
   * by MSBuild Core.
   * `-getItem:{itemName,...}`
   */
  Items?: typeof msbuildEvaluationOutput.infer.Items
  /**
   * The specified Targets and their output values as evaluated by MSBuild
   * Core.
   * `-getTargetResult:{targetName,...}`
   */
  TargetResults?: typeof msbuildEvaluationOutput.infer.TargetResults
}

class EvaluationOptions {
  private static t = type(
    {
      FullName: 'string',
      SetProperties: type({ '[string]': 'string' }),
      Target: 'string[]',
      GetItems: 'string[]',
      GetProperties: 'string[]',
      GetTargetResults: 'string[]',
    },
  )

  constructor(opts: typeof EvaluationOptions.t.infer) {
    opts = EvaluationOptions.t.from(opts)
    this.FullName = opts.FullName
    this.Properties = opts.SetProperties
    this.GetItem = opts.GetItems
    this.GetProperty = opts.GetProperties
    this.Target = opts.Target
    this.GetTargetResults = opts.GetTargetResults
  }

  /**
   * The project file's full path.
   */
  FullName: string
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
  Properties: Record<string, string>
  /**
   * MSBuild Items to evaluate. `["Compile"]` will result in the MSBuild output
   * including {@link MSBuild}
   */
  GetItem: string[]
  GetProperty: string[]
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
  Target: string[] = []
  GetTargetResults: string[]
}

export class MSBuildProject {
  public static readonly MatrixProperties: readonly string[] = Object.freeze([
    'TargetFramework',
    'TargetFrameworks',
    'RuntimeIdentifier',
    'RuntimeIdentifiers',
  ])

  /**
   * Creates an instance of MSBuildProject.
   * @param {object} opts The order-independent arguments for this constructor.
   * Properties may be added or moved around in this definition without
   * breaking compatibility.
   * @param {string} opts.fullPath
   */
  public constructor(opts: { fullPath: string, projTargets: string[], evaluation: MSBuildEvaluationOutput }) {
    this.Items = opts.evaluation.Items ?? {}
    this.Properties = new NugetProjectProperties(
      opts.fullPath,
      new CaseInsensitiveMap<string, string>(
        Object.entries(opts.evaluation.Properties ?? {}),
      ),
    )
    this.Targets = opts.projTargets
    this.TargetResults = opts.evaluation.TargetResults !== undefined ? [opts.evaluation.TargetResults] : []
  }

  readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>
  readonly Properties: Readonly<NugetProjectProperties>
  readonly Targets: readonly string[]
  /**
   * @remarks Allows appending subsequent target results.
   */
  readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][]

  static async getTargets(projectPath: string, includeNonPublic = false): Promise<string[]> {
    return execAsync(`dotnet msbuild ${projectPath} -targets`,
    ).then((v) => {
      const targets = v.stdout.split('\n').map(v => v.replace('\r', ''))
      if (includeNonPublic)
        return targets
      return targets.filter(v => !v.startsWith('_'))
    })
  }

  /**
   * Evaluate {@link Items}, {@link Properties}, and {@link TargetResults},
   * returning them as an instance of {@link MSBuildProject}.\
   * @remarks MSBuild will probably fail if Restore is skipped and another
   * target is specified. If you choose Pack, you must do ['Restore', 'Pack']
   */
  public static async Evaluate(options: EvaluationOptions, projTargets?: string[]): Promise<MSBuildProject> {
    // reminder: args containing spaces and semi-colons MUST be quote-enclosed!
    options.FullName = MSBuildProjectProperties.GetFullPath(options.FullName)
    const _pairs = Object.entries(options.Properties)
    const property = _pairs.length === 0
      ? ''
      : `"-p:${_pairs.map(pair => `${pair[0]}=${pair[1]}`).join(';')}"`
    const target = options.Target.length === 0 ? '' : `"-t:${options.Target.join(';')}"`
    const getItem = options.GetItem.length === 0 ? '' : `"-getItem:${options.GetItem.join()}"`
    const getProperty = options.GetProperty.length === 0 ? '' : `"-getProperty:${options.GetProperty.join()}"`
    const getTargetResult = options.GetTargetResults.length === 0 ? '' : `"-getTargetResult:${options.GetTargetResults.join()}"`
    const cmdLine = ['dotnet', 'msbuild', options.FullName, property, target, getItem, getProperty, getTargetResult].filter(v => v !== '').join(' ')
    const stdPair = await execAsync(cmdLine)
    const evaluation = new MSBuildEvaluationOutput(
      stdPair.stdout.startsWith('{')
        ? JSON.parse(stdPair.stdout)
        : msbuildEvaluationOutput.from({
          Properties: {
            [options.GetProperty[0]]: String(JSON.parse(stdPair.stdout)),
          },
        }),
    )
    return new MSBuildProject({
      fullPath: options.FullName,
      projTargets: projTargets ?? await MSBuildProject.getTargets(options.FullName),
      evaluation,
    })
  }

  public static async PackableProjectsToMSBuildProjects(projectsToPackAndPush: string[]): Promise<MSBuildProject[]> {
    async function toDirEntries(projectsToPackAndPush: string[]): Promise<Dirent[]> {
      async function makeAbsolute(path: string) {
        return isAbsolute(path) ? path : resolve(path)
      }
      const dirEntries: (Dirent | Dirent[])[] = await Promise.all(
        projectsToPackAndPush.map(async (proj) => {
          proj = await realpath(await makeAbsolute(proj))
          const stats = await stat(proj)
          let entries: Dirent[]

          if (stats.isFile()) {
            entries = await readdir(dirname(proj), { withFileTypes: true })
            const dirent: Dirent | undefined = entries.find(v =>
              resolve(v.parentPath, v.name) === proj,
            )
            if (dirent)
              return dirent
            else
              throw new Error(`file "${proj}" not found. It may have been moved or deleted.`)
          }
          if (!stats.isDirectory())
            throw new Error(`"${proj}" is not a file or directory`)

          entries = await readdir(proj, { withFileTypes: true })
          return entries.filter(v =>
            v.isFile() && (v.name.endsWith('.csproj') || v.name.endsWith('.fsproj')),
          )
        }),
      )

      return dirEntries.flat()
    }

    return Promise.all(
      await toDirEntries(projectsToPackAndPush)
        .then(direntArr =>
          direntArr.map(async (dirent): Promise<MSBuildProject> => {
            const fullPath = join(dirent.parentPath, dirent.name)
            const projTargets: Promise<string[]> = MSBuildProject.getTargets(fullPath)
            // this might be too long for a command line. What was is on Windows?
            // 2^15 (32,768) character limit for command lines?
            const getProperties = getOwnPropertyDescriptors(
              NugetProjectProperties, true, true,
            ).map(
              o => Object.entries(o),
            ).flat().filter(// if predicate is true, e is a getter
              e => typeof e[1].get === 'function' && e[0] !== '__proto__',
            ).map(// return the getter's name (the MSBuild property name)
              v => v[0],
            )
            return await this.Evaluate(
              new EvaluationOptions(
                {
                  FullName: fullPath,
                  GetItems: [],
                  GetProperties: getProperties,
                  GetTargetResults: [],
                  SetProperties: {},
                  Target: await projTargets.then(v => v.includes('Pack') ? ['Pack'] : []),
                },
              ),
              await projTargets,
            )
          }),
        ),
    )
  }
}
