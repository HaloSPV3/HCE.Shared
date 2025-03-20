/** Semantic-Release Config Factory (dotnet)
 * A functional Semantic-Release configuration for dotnet projects
 *
 * extends {@link baseConfig }
 *
 * <-- TABLE OF CONTENTS -->
 * - configureDotnetRelease
 * - Insert-Edit Plugins
 * - Append Plugins
 *
 */

import { inspect } from 'node:util';
import type { Options } from 'semantic-release';
import type { Options as SRExecOptions } from '@semantic-release/exec';
import debug from './debug.js';
import { configureDotnetNugetPush, configurePrepareCmd } from './dotnet/helpers.js';
import { getEnvVarValue } from './utils/env.js';
import { baseConfig } from './semanticReleaseConfig.js';
import { NugetRegistryInfo } from './dotnet/NugetRegistryInfo.js';
import { MSBuildProject } from './dotnet/MSBuildProject.js';
import { NugetProjectProperties } from './dotnet/NugetProjectProperties.js';
import { listOwnGetters } from './utils/reflection.js';
import { MSBuildProjectProperties } from './dotnet/MSBuildProjectProperties.js';

type UnArray<T> = T extends (infer U)[] ? U : T;
interface SRConfigDotnetOptions extends Omit<typeof baseConfig, 'plugins'> {
  plugins: (UnArray<typeof baseConfig.plugins> | [string, unknown])[];
}

/**
 * @public
 * @class SemanticReleaseConfigDotnet
 */
export class SemanticReleaseConfigDotnet {
  private options: SRConfigDotnetOptions;
  private _projectsToPublish: string[] | MSBuildProject[];
  private _projectsToPackAndPush: string[] | NugetRegistryInfo[];
  private _evaluatedProjects: MSBuildProject[];

  /**
   * Creates an instance of SemanticReleaseConfigDotnet.
   * Configures {@link baseConfig} with `@semantic-release/exec` to `dotnet` publish, pack, and push.
   *
   * Note: To sign packages, create a Target in the corresponding project(s) e.g.
   * ```xml
   * <Target Name="SignNupkgs" AfterTargets="Pack">
   *   <Exec Command="dotnet nuget sign $(PackageOutputPath) [remaining args]" ConsoleToMsBuild="true" />
   * </Target>
   * ```
   * Alternatively, splice your signing commands into the publishCmd string,
   * inserting them before `dotnet nuget push`.
   * If you sign different signatures depending on the NuGet registry,
   * splice your signing command (with "overwrite signature" enabled, if
   * desired) before the corresponding registry's `dotnet nuget push` command.
   *
   * @constructor
   * @public
   * @param {string[]} projectsToPublish An array of dotnet projects' relative paths. If
   * empty or unspecified, tries getting projects' semi-colon-separated relative
   * paths from the `PROJECTS_TO_PUBLISH` environment variable. If configured as
   * recommended, the projects' publish outputs will be zipped to '$PWD/publish'
   * for use in the `publish` semantic-release step (typically, GitHub release).
   * @param {string[] | NugetRegistryInfo[]} projectsToPackAndPush An array of dotnet projects' relative paths.
   * If empty or unspecified, tries getting projects' semi-colon-separated
   * relative paths from the `PROJECTS_TO_PACK_AND_PUSH` environment variable.
   * Otherwise, no packages will be packed and pushed.
   * If configured as recommended, `dotnet pack` will output the nupkg/snupkg
   * files to `$PWD/publish` where they will be globbed by `dotnet nuget push`.
   */
  constructor(
    projectsToPublish: string[] | MSBuildProject[],
    projectsToPackAndPush: string[] | NugetRegistryInfo[],
  ) {
    this.options = baseConfig;
    /* normalize PluginSpecs to tuples */
    this.options.plugins = this.options.plugins.map(pluginSpec => typeof pluginSpec === 'string'
      ? [pluginSpec, {}]
      : pluginSpec,
    );

    this._projectsToPublish = projectsToPublish;
    if (this._projectsToPublish.length === 0) {
      const p = getEnvVarValue('PROJECTS_TO_PUBLISH')?.split(';');
      if (p && p.length > 0) {
        this._projectsToPublish = p;
      }
      else if (debug.enabled) {
        debug.log(new Error('At least one project must be published. `projectsToPackAndPush` is empty and environment variable `PROJECTS_TO_PUBLISH` is undefined or empty.'));
      }
    }

    this._projectsToPackAndPush = projectsToPackAndPush;
    if (this._projectsToPackAndPush.length === 0) {
      const p = getEnvVarValue('PROJECTS_TO_PACK_AND_PUSH')?.split(';');
      if (p && p.length > 0) {
        this._projectsToPackAndPush = p;
      }
      else if (debug.enabled) {
        debug.log(new Error('projectsToPackAndPush.length must be > 0 or PROJECTS_TO_PACK_AND_PUSH must be defined and contain at least one path.'));
      }
    }

    // may be zero-length array
    this._evaluatedProjects = [
      ...this._projectsToPublish.filter(v => v instanceof MSBuildProject),
      ...this._projectsToPackAndPush
        .filter(v => v instanceof NugetRegistryInfo)
        .map(v => v.project),
    ];
  }

  get ProjectsToPublish(): string[] | MSBuildProject[] {
    return this._projectsToPublish;
  }

  get ProjectsToPackAndPush(): string[] | NugetRegistryInfo[] {
    return this._projectsToPackAndPush;
  }

  get EvaluatedProjects(): MSBuildProject[] {
    return this._evaluatedProjects;
  }

  insertPlugin(
    afterPluginsIDs: string[],
    insertPluginIDs: string[],
    beforePluginsIDs: string[],
  ) {
    const pluginIDs = new Array(...this.options.plugins).map(v =>
      typeof v === 'string' ? v : v[0],
    );

    // if any beforePluginIDs are ordered before the last afterPlugin, throw. Impossible to sort.

    const indexOfLastAfter = afterPluginsIDs
      .filter(v => pluginIDs.includes(v))
      .map(v => pluginIDs.indexOf(v))
      .sort()
      .find((_v, i, obj) => i === obj.length - 1);
    if (!indexOfLastAfter)
      throw new ReferenceError(
        'An attempt to get the last element of an array returned undefined.',
      );

    const indicesOfBefore = beforePluginsIDs
      .filter(v => pluginIDs.includes(v))
      .map(v => pluginIDs.indexOf(v))
      .sort();

    // This for-of collects *all* sorting errors. The resulting AggregateError
    // notifies the API user of *all* errors in the order rather than just the
    // first error encountered.
    const errors: Error[] = [];
    for (const index of indicesOfBefore) {
      if (index <= indexOfLastAfter) {
        errors.push(
          new Error(
            `insertPlugin was instructed to insert one or more plugins after [${afterPluginsIDs.map(v => `"${v}"`).join(', ')}] and before [${beforePluginsIDs.map(v => `"${v}"`).join(', ')}], but ${pluginIDs[indexOfLastAfter]} comes after ${pluginIDs[index]}!`,
          ),
        );
      }
    }
    if (errors.length > 0)
      throw new AggregateError(errors);

    // insert plugin(s)
    this.options.plugins.splice(
      indexOfLastAfter + 1,
      0,
      ...insertPluginIDs.map(id =>
        [id, {}] as [string, unknown],
      ),
    );
  }

  /**
   * generate dotnet commands for \@semantic-release/exec, appending commands with ' && ' when necessary.
   * ?todo: change to builder method? e.g. static async SetupDotnetCommands(this: SemanticReleaseConfigDotnet): Promise<SemanticReleaseConfigDotnet>
   *
   * @public
   * @async
   * @see https://github.com/semantic-release/exec#usage
   */
  async setupDotnetCommands(): Promise<void> {
    const srExecIndex = this.options.plugins.findIndex(
      v => v[0] === '@semantic-release/exec',
    );
    const execOptions = this.options.plugins[srExecIndex] as SRExecOptions;

    // TODO: move configurePrepareCmd into SemanticReleaseConfigDotnet
    // ensure all packable projects are evaluated
    this._projectsToPackAndPush = await Promise.all(
      this.ProjectsToPackAndPush.map(async (v) => {
        if (typeof v === 'string') {
          const msbp = await MSBuildProject.Evaluate({
            FullName: v,
            GetItem: [],
            GetProperty: [
              ...MSBuildProject.MatrixProperties,
              ...listOwnGetters(MSBuildProjectProperties.prototype),
              ...listOwnGetters(NugetProjectProperties.prototype),
            ],
            GetTargetResult: [],
            Property: {},
            Targets: ['Restore', 'Pack'],
          });

          this._evaluatedProjects.push(msbp);

          return new NugetRegistryInfo({ project: msbp });
        }
        else return v;
      }),
    );
    // todo: double-check token-testing commands. Are they formatted prepended correctly?
    const prepareCmdAppendix = await configurePrepareCmd(
      this._projectsToPublish,
      this._projectsToPackAndPush,
    );

    // 'ZipPublishDir' zips each publish folder to ./publish/*.zip
    execOptions.prepareCmd
      = (execOptions.prepareCmd?.length ?? 0) > 0
        ? `${execOptions.prepareCmd} && ${prepareCmdAppendix}`
        : prepareCmdAppendix;

    // FINISHED execOptions.prepareCmd
    // STARTING execOptions.publishCmd
    if (this._projectsToPackAndPush.length > 0) {
      const publishCmdAppendix = await configureDotnetNugetPush(
        this._projectsToPackAndPush,
      );
      execOptions.publishCmd
        = execOptions.publishCmd && execOptions.publishCmd.length > 0
          ? `${execOptions.publishCmd} && ${publishCmdAppendix}`
          : publishCmdAppendix;
    }

    // FINISHED execOptions.publishCmd
  }

  /**
   * Insert a plugin into the plugins array.
   *
   * @deprecated EXPERIMENTAL: needs thorough tests implemented before use in production!
   * @public
   * @param {string[]} insertAfterPluginIDs Plugins which should appear BEFORE
   * {@link insertPluginIDs}.
   * @param {string[]} insertPluginIDs The plugin(s) to insert into the plugins array.
   * @param {string[]} insertBeforePluginsIDs plugins which should appear AFTER the
   * inserted plugin(s).
   */
  splicePlugin(
    insertAfterPluginIDs: string[],
    insertPluginIDs: string[],
    insertBeforePluginsIDs: string[],
  ): void {
    const errors: Error[] = [];
    const pluginIDs = new Array(...this.options.plugins).map(v =>
      typeof v === 'string' ? v : v[0],
    );

    // if any beforePluginIDs are ordered before the last afterPlugin, throw. Impossible to sort.

    const indexOfLastPreceding: number | undefined = insertAfterPluginIDs
      .filter(v => pluginIDs.includes(v))
      .map(v => pluginIDs.indexOf(v))
      .sort()
      .find((_v, i, obj) => i === obj.length - 1);
    if (!indexOfLastPreceding)
      throw new ReferenceError(
        'An attempt to get the last element of indexOfLastAfter returned undefined.',
      );

    const indicesOfBefore: number[] = insertBeforePluginsIDs
      .filter(v => pluginIDs.includes(v))
      .map(v => pluginIDs.indexOf(v))
      .sort();

    for (const index of indicesOfBefore) {
      if (index <= indexOfLastPreceding) {
        const formattedInsertIds: string
          = '[' + insertPluginIDs.map(v => `"${v}"`).join(', ') + ']';
        const formattedAfterIds: string
          = '[' + insertAfterPluginIDs.map(v => `"${v}"`).join(', ') + ']';
        const formattedBeforeIds: string
          = '[' + insertBeforePluginsIDs.map(v => `"${v}"`).join(', ') + ']';
        errors.push(
          new Error(
            `insertPlugin was instructed to insert ${formattedInsertIds} after ${formattedAfterIds} and before ${formattedBeforeIds}, `
            + `but ${pluginIDs[indexOfLastPreceding]} is ordered after ${pluginIDs[index]}!`,
          ),
        );
      }
    }

    if (errors.length > 0)
      throw new AggregateError(errors);

    this.options.plugins.splice(
      indexOfLastPreceding + 1,
      0,
      ...insertPluginIDs.map(v => [v, {}] satisfies [string, unknown]),
    );
  }

  // todo: join result with dummy pack commands
  protected async getTokenTestingCommands(): Promise<string> {
    let promiseProjects;
    if (
      this.ProjectsToPackAndPush.every(
        nri => nri instanceof NugetRegistryInfo,
      )
    ) {
      promiseProjects = this.ProjectsToPackAndPush.map(nri => nri.project);
    }
    else {
      promiseProjects = await MSBuildProject.PackableProjectsToMSBuildProjects(
        this.ProjectsToPackAndPush,
      );
    }

    /** if a project is not in {@link EvaluatedProjects}, add it */
    for (const project of promiseProjects) {
      if (!this.EvaluatedProjects.includes(project))
        this.EvaluatedProjects.push(project);
    }

    const regInfos = promiseProjects.map(
      p => new NugetRegistryInfo({ project: p }),
    );
    const nupkgPaths = await Promise.all(
      regInfos.map(async nri =>
        nri.PackDummyPackage({}).then((nupkgs) => {
          // this is a full file path.
          const mainNupkg = nupkgs.find(nupkg =>
            RegExp(/(?<!symbols)\.nupkg$/).test(nupkg),
          );
          if (mainNupkg !== undefined)
            return { nri: nri, nupkgPath: mainNupkg } as const;
          throw new Error(
            'None of the following dummy packages are non-symbol .nupkg files:\n'
            + nupkgs.map(nupkg => `  - ${nupkg}`).join('\n')
            + '\nIf you intended to push only symbol packages, check if a feature request already exists (https://github.com/HaloSPV3/HCE.Shared/issues?q=push+snupkg) and, if one does not exist, create one containing the keywords "push snupkg".',
          );
        }),
      ),
    );
    const pushCommands = nupkgPaths.map(pair =>
      pair.nri.GetPushDummyCommand({ root: pair.nupkgPath }),
    );
    return pushCommands.join(' && ');
  }

  async toOptions(): Promise<Options> {
    return this.options;
  }
}

/**
 * Configures {@link baseConfig} with `@semantic-release/exec` to `dotnet` publish, pack, and push.
 * @param projectsToPublish An array of dotnet projects' relative paths.
 * If empty, tries getting projects' semi-colon-separated relative
 * paths from the `PROJECTS_TO_PUBLISH` environment variable.
 * If configured as recommended, the projects' publish outputs will be zipped to
 * '$PWD/publish' for use in the `publish` semantic-release step (typically,
 * GitHub release).
 * @param projectsToPackAndPush An array of dotnet projects' relative paths.
 * If empty, `dotnet pack` and `dotnet nuget push` commands will not be configured.
 * If undefined, tries getting projects' semi-colon-separated relative paths
 * from the `PROJECTS_TO_PACK_AND_PUSH` environment variable.
 * With the recommended configuration, `dotnet pack` will write the nupkg/snupkg
 * files to `$PWD/publish` where they will be globbed by `dotnet nuget push`.
 * @returns a semantic-release Options object, based on
 * `@halospv3/hce.shared-config` (our base config), with the
 * `@semantic-release/exec` plugin configured to `dotnet publish`, `pack`, and
 * `push` the specified projects.
 */
export async function getConfig(
  projectsToPublish: string[] | MSBuildProject[],
  projectsToPackAndPush?: string[] | NugetRegistryInfo[],
): Promise<Options> {
  if (debug.enabled) {
    debug.log(
      'hce.shared-config:\n' + inspect(baseConfig, false, Infinity, true),
    );
  }

  const errors: Error[] = [];

  if (projectsToPublish.length === 0) {
    const _ = getEnvVarValue('PROJECTS_TO_PUBLISH');
    if (_ === undefined)
      errors.push(
        new Error(
          'projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.',
        ),
      );
    else projectsToPublish = _.split(';');
  }

  if (!projectsToPackAndPush) {
    const _ = getEnvVarValue('PROJECTS_TO_PACK_AND_PUSH');
    if (_ === undefined)
      errors.push(
        new Error(
          'projectsToPackAndPush.length must be > 0 or PROJECTS_TO_PACK_AND_PUSH must be defined and contain at least one path.',
        ),
      );
    else projectsToPackAndPush = _.split(';');
  }

  if (errors.length > 0) {
    throw new Error(
      [
        'getConfig cannot continue. One or more errors occurred.',
        ...errors.map(v => v.stack),
      ].join('\n'),
    );
  }

  const config = new SemanticReleaseConfigDotnet(
    projectsToPublish,
    projectsToPackAndPush ?? [],
  );
  await config.setupDotnetCommands();

  const options = await config.toOptions();
  if (debug.enabled) {
    console.debug(
      `modified plugins array:\n${inspect(options.plugins, false, Infinity)}`,
    );
  }

  return options;
}

/**
 * @module semanticReleaseConfigDotnet
 * @export {SemanticReleaseConfigDotnet}
 */
