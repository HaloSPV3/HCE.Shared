/* JSDoc Types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SemanticReleaseConfigDotnet as _srcd } from '../semanticReleaseConfigDotnet.ts';
import type { NugetProjectProperties } from './NugetProjectProperties.ts';
/* eslint-enable @typescript-eslint/no-unused-vars */

import { config as configDotenv } from '@dotenvx/dotenvx';
import { type, type Type } from 'arktype';
import { detectFile, detectFileSync } from 'chardet';
import { ok } from 'node:assert/strict';
import type { ExecException } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
// eslint-disable-next-line unicorn/import-style
import * as node_path from 'node:path';
import { cwd, env } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { isError } from '../utils/isError.ts';
import sanitizeFileName from 'sanitize-filename';
import { getEnvVarValue as getEnvironmentVariableValue } from '../utils/env.ts';
import { execAsync } from '../utils/execAsync.ts';
import { catchEBUSY, MSBuildEvaluationOutput, MSBuildProject } from './MSBuildProject.ts';
import type { Default } from 'arktype/internal/attributes.ts';

type TemporaryDirectoryNamespace_Unix = `${ReturnType<typeof tmpdir>}/HCE.Shared/.NET/Dummies`;
type TemporaryDirectoryNamespace_Win = `${ReturnType<typeof tmpdir>}\\HCE.Shared\\.NET\\Dummies`;
const temporaryDirectoryNamespace = node_path.join(tmpdir(), 'HCE.Shared', '.NET', 'Dummies') as TemporaryDirectoryNamespace_Unix | TemporaryDirectoryNamespace_Win;
const defaultNugetSource = 'https://api.nuget.org/v3/index.json';
const key_OutputPackItems = '_OutputPackItems';
/**
 * Read the contents of $GITHUB_OUTPUT (if its value is a file path) or $TEMP/GITHUB_OUTPUT.
 * If the file doesn't exist, it is created.
 * @returns If successful, a promised object with a parsed key.
 */
export async function getGithubOutput(): Promise<ReturnType<typeof configDotenv>['parsed']> {
  if (env['GITHUB_OUTPUT'] === undefined || !existsSync(env['GITHUB_OUTPUT'])) {
    const githubOutputPath: string = node_path.join(tmpdir(), 'GITHUB_OUTPUT');
    if (!existsSync(githubOutputPath))
      await writeFile(githubOutputPath, '');
    env['GITHUB_OUTPUT'] = githubOutputPath;
  }

  const encoding = await detectFile(env['GITHUB_OUTPUT']);
  const environmentOutput = configDotenv({
    path: env['GITHUB_OUTPUT'],
    override: true,
    encoding: encoding ?? undefined,
    processEnv: {},
  });

  if (isError(environmentOutput.error))
    throw environmentOutput.error;
  return environmentOutput.parsed;
}

/**
 * Read the contents of $GITHUB_OUTPUT (if its value is a file path) or $TEMP/GITHUB_OUTPUT.
 * If the file doesn't exist, it is created.
 * @returns An object with a parsed key if successful.
 */
export function getGithubOutputSync(): NonNullable<ReturnType<typeof configDotenv>['parsed']> {
  if (env['GITHUB_OUTPUT'] === undefined || !existsSync(env['GITHUB_OUTPUT'])) {
    const githubOutputPath: string = node_path.join(tmpdir(), 'GITHUB_OUTPUT');
    if (!existsSync(githubOutputPath))
      writeFileSync(githubOutputPath, '');
    env['GITHUB_OUTPUT'] = githubOutputPath;
  }

  const encoding = detectFileSync(env['GITHUB_OUTPUT']);
  const environmentOutput = configDotenv({
    path: env['GITHUB_OUTPUT'],
    override: true,
    encoding: encoding ?? undefined,
    processEnv: {},
  }) as { error: Error }
  | { parsed: NonNullable<ReturnType<typeof configDotenv>['parsed']> };

  if ('error' in environmentOutput)
    throw environmentOutput.error;
  return environmentOutput.parsed;
}

type DummiesDirectory<T> = T extends undefined
  ? `${TemporaryDirectoryNamespace_Unix}/` | `${TemporaryDirectoryNamespace_Win}\\`
  : T extends MSBuildProject
    ? `${TemporaryDirectoryNamespace_Unix}/${T['Properties']['PackageId']}/` | `${TemporaryDirectoryNamespace_Win}\\${T['Properties']['PackageId']}\\`
    : never;

function getDummiesDirectory<T extends MSBuildProject | undefined = undefined>(project?: T): DummiesDirectory<T>;
function getDummiesDirectory<T extends MSBuildProject>(project: T): DummiesDirectory<T>;
/**
 * Get HCE.Shared's temporary directory for .NET projects' dummy packages.
 * @param project The MSBuild project whose PackageId will be used to create a
 * directory for its dummy packages.
 * @returns a platform-specific path like
 * `${tmpdir()}/HCE.Shared/.NET/Dummies/${project.Properties.PackageId}` if
 * {@link project} is defined. Else `${tmpdir()}/HCE.Shared/.NET/Dummies`
 */
function getDummiesDirectory<T extends MSBuildProject | undefined = undefined>(project?: T): DummiesDirectory<typeof project> {
  switch (true) {
    case project === undefined: {
      return node_path.join(temporaryDirectoryNamespace, node_path.sep) as
        DummiesDirectory<typeof project> satisfies
        ReturnType<typeof getDummiesDirectory>;
    }
    case project instanceof MSBuildProject: {
      return node_path.join(temporaryDirectoryNamespace, project.Properties.PackageId, node_path.sep) as
        DummiesDirectory<typeof project> satisfies
        ReturnType<typeof getDummiesDirectory<MSBuildProject>>;
    }
    default: {
      throw new Error('The type of argument `project` must be `undefined` or `MSBuildProject`.');
    }
  }
}

/**
 * Get the environment variables as key-value pairs.
 * @param tokenEnvironmentVariables The name of the environment variables whose values are
 * NuGet API keys.
 * @returns an array of key-value pairs of the given environment variables and
 * their values, filtered to only those whose values are not undefined.
 * @throws {Error} when none of the provided environment variables are defined.
 */
function _GetTokenEnvironmentVariables(tokenEnvironmentVariables: readonly string[]): undefined | [readonly [string, string], ...readonly [string, string][]] {
  const definedTokens = Object.freeze(
    tokenEnvironmentVariables
      .map((key: string) => [key, getEnvironmentVariableValue(key)] as const)
      .filter((environmentVariableTuple: readonly [string, string | undefined]): environmentVariableTuple is [string, string] =>
        environmentVariableTuple[1] !== undefined,
      ),
  );

  if (definedTokens.length > 0)
    return definedTokens as [readonly [string, string], ...readonly [string, string][]];
  return undefined;
}

export class NugetRegistryInfo {
  public static readonly DefaultTokenEnvVars: readonly ['NUGET_TOKEN']
    = Object.freeze(['NUGET_TOKEN'] as const);

  /**
   * Get the API token from {@link NugetRegistryInfo#resolvedEnvVariable}
   * @param resolvedEnvironmentVariable The name of the environment variable(s) whose
   * value is a NuGet API key. Typically, the value of
   * {@link NugetRegistryInfo#resolvedEnvVariable}.
   * @returns The value of the first defined environment variable.
   * @throws {Error} when none of the provided environment variables are defined.
   */
  private static _GetTokenValue(resolvedEnvironmentVariable: string): string {
    type.string.assert(resolvedEnvironmentVariable);

    const tokenValue = getEnvironmentVariableValue(resolvedEnvironmentVariable);
    if (tokenValue === undefined) {
      throw new Error(`\
The environment variable ${resolvedEnvironmentVariable} was specified \
as the source of the token to push a NuGet package, \
but the environment variable is empty or undefined.`);
    }
    return tokenValue;
  }

  /**
   * Convert a URL string to a filesystem folder name.
   *
   * Intended usage: modify the output path of `dotnet pack` based on the NuGet
   * Source the package should be pushed to. This is extra work is usually
   * unnecessary and you'd typically push the same file to multiple sources.
   * This is for the edge-case scenario of creating multiple nupkgs and signing
   * each one with a different certificate corresponding to a given NuGet
   * Source. This is only useful if the Sources have different certificates
   * registered for a given package/user/organization.
   * @param source The URL of the NuGet Source
   * @returns A string suitable for a local filesystem folder name, formatted as
   * `${hostname}_${pathname.replace('/', '_')}`.
   */
  static GetDirNameForSource(source: string): string {
    return sanitizeFileName(
      source.replaceAll(/\/index.json$/g, ''),
      { replacement: '_' },
    );
  }

  private _canPushPackagesToSource: Promise<true> | undefined = undefined;
  private readonly _project: MSBuildProject;
  private readonly _resolvedEnvVariable: string | undefined;
  private readonly _source: string;

  /**
   * Creates an instance of NugetRegistryInfo.\
   * This class enables the ability to push a given {@link project}'s
   * package(s) to the {@link source} of a given NuGet Source's API endpoint with
   * a user-defined API key. This API key, herein referred to as a "token", is
   * derived from the {@link tokenEnvVars} array. This array is iterated through
   * until one of the items is discovered to be an existing environment variable
   * (or is defined in a file named '.env' in the current working directory for
   * LOCAL TESTING ONLY! Do NOT `git add` your private keys!).
   * \
   * WARNING:
   * - The token value is stored privately within this class, but it is plain text.
   * - This private key may be copied to command line strings stored in Semantic
   *   Release's config object for later use by `@semantic-release/exec`.
   * - Other EcmaScript modules can access the environment variable(s) and steal
   *   your key. Be aware of malicious dependencies!
   * @param options The input type of {@link NRIOpts.from}
   * @param options.project The project whose package(s) will be
   * pushed.\
   * - Its {@link NugetProjectProperties#PackageId} will be read.\
   * - Its {@link NugetProjectProperties#PackageVersion} will be overridden via CLI args when creating a dummy package. The real package's
   * `PackageVersion` will *not* be overridden.
   * @param [options.tokenEnvVars] The environment variables
   * whose values are tokens with permission to push a package to the NuGet
   * package registry. The array is iterated through until one token is found.
   * If none of the environment variables are defined, this constructor will
   * throw an {@link Error}.
   * @param [options.source] A NuGet package registry's API endpoint URL or name. Default: 'https://api.nuget.org/v3/index.json'
   */
  constructor(options: typeof NRIOpts['inferIn']) {
    // note: you can reassign `options` only when typeof `inferOut` is assignable
    // to typeof `inferIn`.
    const validOptions = NRIOpts.from(options);
    this._project = validOptions.project;
    /**
     * May throw! Assign key of the first key-value pair to
     * {@link resolvedEnvVariable}
     */
    const tokenVariables = _GetTokenEnvironmentVariables(validOptions.tokenEnvVars);
    if (tokenVariables)
      this._resolvedEnvVariable = tokenVariables[0][0];
    this._source = validOptions.source;
  }

  public get project(): MSBuildProject {
    return this._project;
  }

  /**
   * This is not useful without it being executed as part of a Semantic Release
   * plugin. Deferring this to `@semantic-release/exec`'s prepareCmd is possible,
   * but impractical. You'd need to configure prepareCmd to invoke something
   * like `node customScriptFile.mjs`. It's not worth the hassle.
   * @returns `true` if the token can be used to push nupkg to the given Nuget registry
   * @throws {TypeError | Error | import('../utils/execAsync.js').ChildProcessSpawnException }
   * - {@link Error} | {@link module:utils/execAsync:ChildProcessSpawnException ChildProcessSpawnException}
   *   - The token is invalid, of the wrong token type, or lacks permission to push packages
   *   - The URL does not exist or a connection could not be established
   *   - The command line string is malformed.
   * @deprecated Call during the `verifyConditions` step of Semantic Release! Additionally, {@link GetIsNextVersionAlreadyPublishedCommand}'s return value should be assigned to `prepareCmd` to prevent package version collision errors.
   */
  public get canPushPackagesToSource(): Promise<true> {
    if (this._canPushPackagesToSource !== undefined)
      return this._canPushPackagesToSource;

    let tokenValue: string | undefined;
    if (this.resolvedEnvVariable !== undefined)
      tokenValue = NRI._GetTokenValue(this.resolvedEnvVariable);

    if (tokenValue?.startsWith('github_pat_')) {
      const errorMessage = `The value of the token in 'resolvedEnvVariable' ${String(this.resolvedEnvVariable)} begins with 'github_pat_', indicating it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`;
      const error = new Error(errorMessage);
      return this._canPushPackagesToSource = Promise.reject(error);
    }

    return this._canPushPackagesToSource = this.PackDummyPackage({})
      // eslint-disable-next-line unicorn/prefer-await
      .then(async () => await this._PushDummyPackages({
        apiKey: tokenValue,
      }))
      // eslint-disable-next-line unicorn/prefer-await
      .then<true>((execAsyncReturn) => {
        ok(execAsyncReturn);
        return true as const;
      });
  }

  /**
   * The first environment variable found to have a defined value. Set by
   * {@link _GetTokenEnvVariables} in the constructor.
   * @returns The first environment variable found to have a defined value.
   */
  get resolvedEnvVariable(): string | undefined {
    return this._resolvedEnvVariable;
  }

  get source(): string {
    return this._source;
  }

  // #region Pack

  /**
   * The type for options and arguments of `dotnet pack`. See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-pack.
   *
   * {@link NRI.PackPackagesOptionsType.t.propertyOverrides `propertyOverrides`}
   * is a wrapper for MSBuild's `-property:<n>=<v>` properties override arg.
   */
  // eslint-disable-next-line unicorn/consistent-class-member-order
  static readonly PackPackagesOptionsType: Type<{
    propertyOverrides?: Record<string, string> | undefined;
    artifactsPath?: string | undefined;
    configuration?: 'Release' | 'Debug' | undefined;
    disableBuildServers?: boolean | undefined;
    force?: boolean | undefined;
    includeSource?: boolean | undefined;
    includeSymbols?: boolean | undefined;
    interactive?: boolean | undefined;
    noBuild?: boolean | undefined;
    noLogo?: boolean | undefined;
    noRestore?: boolean | undefined;
    output?: string | undefined;
    runtime?: string | undefined;
    serviceable?: boolean | undefined;
    terminalLogger?: 'auto' | 'on' | 'off' | undefined;
    useCurrentRuntime?: boolean | undefined;
    verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic' | undefined;
    versionSuffix?: string | undefined;
    '-GetItem'?: readonly string[] | string[] | undefined;
  }> = Object.freeze(
    type({
      /**
       * a custom arg for handling MSBuild's `-property:<n>=<v>` argument for overriding MSBuild properties.
       */
      'propertyOverrides?': type('Record<string,string>'),
      'artifactsPath?': 'string',
      'configuration?': '"Release" | "Debug"',
      'disableBuildServers?': 'boolean',
      'force?': 'boolean',
      'includeSource?': 'boolean',
      'includeSymbols?': 'boolean',
      'interactive?': 'boolean',
      'noBuild?': 'boolean',
      'noLogo?': 'boolean',
      'noRestore?': 'boolean',
      'output?': 'string',
      'runtime?': 'string',
      'serviceable?': 'boolean',
      'terminalLogger?': '"auto" | "on" | "off"',
      'useCurrentRuntime?': 'boolean',
      'verbosity?': '"quiet" | "minimal" | "normal" | "detailed" | "diagnostic"',
      'versionSuffix?': 'string',
      /**
       * MSBuild evaluation option. Added to get the output Nupkgs' file paths.
       * @todo consider adding -GetProperty, -GetTarget
       */
      '-GetItem?': type.string.array().readonly().or('string[]'),
    }),
  );

  public static readonly PackDummyPackagesOptionsType: Type<{
    propertyOverrides?: Record<string, string> | undefined;
    artifactsPath?: string | undefined;
    configuration?: 'Release' | 'Debug' | undefined;
    disableBuildServers?: boolean | undefined;
    force?: boolean | undefined;
    includeSource?: boolean | undefined;
    includeSymbols?: boolean | undefined;
    interactive?: boolean | undefined;
    noBuild?: boolean | undefined;
    noLogo?: boolean | undefined;
    noRestore?: boolean | undefined;
    runtime?: string | undefined;
    serviceable?: boolean | undefined;
    terminalLogger?: 'auto' | 'on' | 'off' | undefined;
    useCurrentRuntime?: boolean | undefined;
    verbosity?: 'quiet' | 'minimal' | 'normal' | 'detailed' | 'diagnostic' | undefined;
    versionSuffix?: string | undefined;
    '-GetItem'?: readonly string[] | string[] | undefined;
  }>
    = this.PackPackagesOptionsType.omit('output');

  /**
   * Get a `dotnet pack` command line string, outputting the package(s) to a
   * path determined by this method's parameters.
   * When pushing the package(s), you only need to supply the main .nupkg's path
   * or its directory to the dotnet CLI—by default, it will also push the
   * symbols package, if present.
   * @param options Options passed to
   * `dotnet pack`, excluding the required `<PROJECT | SOLUTION>` argument. The
   * {@link PackPackagesOptionsType.t.output} path is modified according to the
   * {@link shouldUsePerSourceSubfolder} and {@link shouldUsePerPackageIdSubfolder}
   * arguments.
   * @param shouldUsePerSourceSubfolder If true, the path of the package output will
   * include a subfolder named after the NuGet Source.
   * @param shouldUsePerPackageIdSubfolder If true, the path of the package output
   * will include a subfolder named after the NuGet package's ID.
   * @returns `dotnet pack "${this.project.Properties.MSBuildProjectFullPath}"
   * -o "${outDir}"` where outDir may be `${cwd()}/publish/${NugetRegistryInfo.GetNameForURL(this.source)}/${this._project.Properties.PackageId}`
   */
  GetPackCommand(
    options: typeof NRI.PackPackagesOptionsType.inferIn,
    shouldUsePerSourceSubfolder = false,
    shouldUsePerPackageIdSubfolder = false,
  ): string {
    const validOptions = NRI.PackPackagesOptionsType.from(options);
    type.boolean.assert(shouldUsePerSourceSubfolder);
    type.boolean.assert(shouldUsePerPackageIdSubfolder);

    validOptions.output ??= node_path.join(cwd(), 'publish');
    if (shouldUsePerSourceSubfolder)
      validOptions.output = node_path.join(validOptions.output, NugetRegistryInfo.GetDirNameForSource(this.source), node_path.sep);
    if (shouldUsePerPackageIdSubfolder)
      validOptions.output = node_path.join(validOptions.output, this._project.Properties.PackageId, node_path.sep);

    const packCommandArray: string[] = [
      'dotnet',
      'pack',
      `"${this._project.Properties.MSBuildProjectFullPath}"`,
    ];
    if (validOptions.artifactsPath !== undefined)
      packCommandArray.push('--artifactsPath', `"${validOptions.artifactsPath}"`);
    if (validOptions.configuration !== undefined)
      packCommandArray.push('--configuration', validOptions.configuration);
    if (validOptions.disableBuildServers === true)
      packCommandArray.push('--disable-build-servers');
    if (validOptions.force === true) packCommandArray.push('--force');
    if (validOptions.includeSource === true) packCommandArray.push('--include-source');
    if (validOptions.includeSymbols === true) packCommandArray.push('--include-symbols');
    if (validOptions.interactive === true) packCommandArray.push('--interactive');
    if (validOptions.noBuild === true) packCommandArray.push('--no-build');
    if (validOptions.noLogo === true) packCommandArray.push('--nologo');
    if (validOptions.noRestore === true) packCommandArray.push('--no-restore');
    if (validOptions.runtime !== undefined)
      packCommandArray.push('--runtime', validOptions.runtime);
    if (validOptions.serviceable === true) packCommandArray.push('--serviceable');
    if (validOptions.terminalLogger !== undefined)
      packCommandArray.push('--tl', validOptions.terminalLogger);
    if (validOptions.useCurrentRuntime === true)
      packCommandArray.push('--use-current-runtime');
    if (validOptions.verbosity !== undefined)
      packCommandArray.push('--verbosity', validOptions.verbosity);
    if (validOptions.versionSuffix !== undefined)
      packCommandArray.push('--version-suffix', validOptions.versionSuffix);
    /**
     * Haphazard. I need to override the Version and I'm not considering side
     * effects of arbitrary overrides.
     */
    if (validOptions.propertyOverrides) {
      /** convert propertyOverrides record to "-p:n0=v0;n1=v1;n2=v2" et cetera */
      const assignments: string = '-p:' + Object.entries(validOptions.propertyOverrides)
        .map(v => `${v[0]}=${v[1]}`).join(';');
      packCommandArray.push(`"${assignments}"`);
    }
    if (validOptions['-GetItem'] && validOptions['-GetItem'].length > 0) {
      // -GetItem:_OutputPackItems,MyCustomItem
      packCommandArray.push(`-GetItem:${validOptions['-GetItem'].join(',')}`);
    }
    // MSBuild parses everything after -o as the path.
    packCommandArray.push('-o', `"${validOptions.output}"`);

    return packCommandArray.join(' ');
  }

  /**
   * !Not ready for use! Remove private modifier and commit as `feat(dotnet)` when ready for release!
   * Blocking Issue: convert all dotnet-related functionality to a Semantic Release plugin!
   * The current {@link _srcd SemanticReleaseConfigDotnet} leverages
   * `@semantic-release/exec` to invoke dotnet commands. This is fine for
   * relatively short command lines, but chaining commands with ' && ' results
   * in quickly-growing complexity.
   * NuGet packages should be created during the `prepare` step, but complex
   * configuration of `dotnet pack` via command lines intended to be invoked by
   * `@semantic-release/exec` is impractical.
   * @param options `dotnet pack` options. See `dotnet pack -h`,
   * https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-pack, and
   * {@link PackPackagesOptionsType}.
   * {@link options['-GetItem']} will _always_ have '_OutputPackItems'.
   * @param [shouldUsePerSourceSubfolder] If `true`, modify the output path to
   * include a subfolder bearing a path-safe encoding of the NuGet Source that
   * will receive the nupkg.
   * @param [shouldUsePerPackageIdSubfolder] If `true`, modify the output path
   * to include a subfolder named after the the PackageId.
   * @returns a string[] containing the full file paths of all new packages i.e.
   * .nupkg, .symbols.nupkg, .snupkg
   */
  // @ts-expect-error Todo: publicize to dismiss this "unused" error.
  private async _PackPackages(
    options: typeof NRI.PackPackagesOptionsType.inferIn,
    shouldUsePerSourceSubfolder = false,
    shouldUsePerPackageIdSubfolder = false,
  ): Promise<string[]> {
    options['-GetItem'] = [...options['-GetItem'] ?? [], key_OutputPackItems];

    const packCommand = this.GetPackCommand(
      options,
      shouldUsePerSourceSubfolder,
      shouldUsePerPackageIdSubfolder,
    );
    let packOutput: undefined | { stdout: string; stderr: string };
    while (packOutput === undefined) {
      try {
        packOutput = await setTimeout(
          1000,
          execAsync(packCommand, true),
        );
      }
      catch (error: unknown) {
        catchEBUSY(error);
      }
    }
    // may include .snupkg
    const nupkgFullPaths: string[] | undefined = new MSBuildEvaluationOutput(packOutput.stdout)
      .Items
      ?.[key_OutputPackItems]
      ?.filter(item => item.Extension !== '.nuspec')
      .map(item => item.FullPath);
    return nupkgFullPaths ?? [];
  }

  /**
   * Create a dummy package for the current {@link project} by executing a
   * command line like \``dotnet pack ${this.project.Properties.MSBuildProjectFullPath} -p:Version=0.0.1-DUMMY -output ${getDummiesDir(this._project)}/${GetNameForURL(this.source)}`\`
   * @param options Options passed to
   * `dotnet pack`, excluding the required `<PROJECT | SOLUTION>` argument.
   * - The `output` field is ignored and overwritten. It is replaced with
   *   ${{@link getDummiesDir}({@link project})}/${{@link GetDirNameForSource}({@link source})}
   * - The `output` path will be affixed with a folder named after this
   * {@link NugetRegistryInfo#source}, but will not include a subfolder for the
   * {@link NugetRegistryInfo#project NugetRegistryInfo.project}.{@link MSBuildProject#Properties Properties}.{@link MSBuildProject#Properties#PackageId PackageId}.
   * @returns the full paths of all nupkg, symbols.nupkg, and snupkg files
   * created by the Pack target, as extracted from the dotnet process's STDOUT.
   * If mixed with other nupkgs, filter for the {@link NugetProjectProperties#PackageId}
   */
  public async PackDummyPackage(
    options: typeof NRI.PackDummyPackagesOptionsType.inferIn,
  ): Promise<string[]> {
    const packCommand: string = this.GetPackCommand(
      {
        ...options,
        output: getDummiesDirectory(this._project),
        propertyOverrides: { ...options.propertyOverrides, Version: '0.0.1-DUMMY', UpdateVersionProperties: 'false' },
        '-GetItem': [...options['-GetItem'] ?? [], key_OutputPackItems],
      },
      true,
    );

    let packOutput: undefined | { stdout: string; stderr: string };
    while (packOutput === undefined) {
      try {
        packOutput = await setTimeout(
          1000,
          execAsync(packCommand, true),
        );
      }
      catch (error: unknown) {
        catchEBUSY(error);
      }
    }
    // may include .snupkg
    const nupkgFullPaths: string[] | undefined = new MSBuildEvaluationOutput(packOutput.stdout)
      .Items
      ?.[key_OutputPackItems]
      ?.filter(item => item.Extension !== '.nuspec')
      .map(item => item.FullPath);
    return nupkgFullPaths ?? [];
  }

  // #endregion Pack
  // #region Push

  /**
   * Also includes required argument 'ROOT': the directory in which packages
   * should be present and ready to be pushed the default or specified Source.
   * The ROOT may also include wildcards e.g. `*.nupkg`, `**\\*.nupkg`
   * See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-nuget-push
   *
   * Specific to this API:
   * If you want to use this API's default root value (\`${cwd()}/publish`), assign an empty string.
   */
  static readonly PushPackagesOptionsType: Type<{
    root: string;
    apiKey?: string | undefined;
    configFile?: string | undefined;
    disableBuffering?: boolean | undefined;
    forceEnglishOutput?: boolean | undefined;
    interactive?: boolean | undefined;
    noServiceEndpoint?: boolean | undefined;
    noSymbols?: boolean | undefined;
    skipDuplicate?: boolean | undefined;
    source?: string | undefined;
    symbolApiKey?: string | undefined;
    symbolSource?: string | undefined;
    timeout?: number | undefined;
  }> = Object.freeze(
    type({
    /** If an empty string is passed, this property is overridden to `./publish` */
      root: 'string',
      /** The API key for the server. NOTE: if `undefined` or an empty string, the `dotnet nuget` client will lookup credentials set via `dotnet nuget {add|update} source`. */
      'apiKey?': 'string',
      /** The NuGet configuration file (nuget.config) to use. If specified, only the settings from this file will be used. If not specified, the hierarchy of configuration files from the current directory will be used. For more information, see {@link https://learn.microsoft.com/en-us/nuget/consume-packages/configuring-nuget-behavior Common NuGet Configurations}. */
      'configFile?': 'string',
      /** Disables buffering when pushing to an HTTP(S) server to reduce memory usage. */
      'disableBuffering?': 'boolean',
      /** Forces the application to run using an invariant, English-based culture. */
      'forceEnglishOutput?': 'boolean',
      /** Allows the command to stop and wait for user input or action. For example, to complete authentication. Available since .NET Core 3.0 SDK. */
      'interactive?': 'boolean',
      /** Doesn't append "api/v2/package" to the source URL. */
      'noServiceEndpoint?': 'boolean',
      'noSymbols?': 'boolean',
      /** When pushing multiple packages to an HTTP(S) server, treats any 409 Conflict response as a warning so that other pushes can continue. */
      'skipDuplicate?': 'boolean',
      /**
       * Specifies the server URL. NuGet identifies a UNC or local folder source and simply copies the file there instead of pushing it using HTTP.
       *
       * ### Important
       * > Starting with NuGet 3.4.2, this is a mandatory parameter unless the NuGet config file specifies a `DefaultPushSource` value. For more information, see {@link https://learn.microsoft.com/en-us/nuget/consume-packages/configuring-nuget-behavior Configuring NuGet behavior}.
       */
      'source?': 'string',
      /** The API key for the symbol server. NOTE: if `undefined`, the `dotnet nuget` client will lookup credentials set via `dotnet nuget {add|update} source`.` */
      'symbolApiKey?': 'string',
      /** Specifies the symbol server URL. */
      'symbolSource?': 'string',
      /** Specifies the timeout for pushing to a server in seconds. Defaults to 300 seconds (5 minutes). Specifying 0 applies the default value. */
      'timeout?': 'number',
    }),
  );

  /**
   * {@link NRI.PushPackagesOptionsType} sans {@link NRI.PushPackagesOptionsType.t.root}.
   * The result of {@link getDummiesDir} is used, instead.
   */
  public static readonly PushDummyPackagesOptionsType: Type<{
    apiKey?: string | undefined;
    configFile?: string | undefined;
    disableBuffering?: boolean | undefined;
    forceEnglishOutput?: boolean | undefined;
    interactive?: boolean | undefined;
    noServiceEndpoint?: boolean | undefined;
    noSymbols?: boolean | undefined;
    source?: string | undefined;
    symbolApiKey?: string | undefined;
    symbolSource?: string | undefined;
    timeout?: number | undefined;
    skipDuplicate: Default<true, true>;
  }>
    = NugetRegistryInfo.PushPackagesOptionsType.merge({
      skipDuplicate: 'true = true',
    }).omit('root');

  /**
   * Create a `dotnet nuget push` command line from the given options and
   * optional boolean parameters.
   * @param options See {@link PushPackagesOptionsType}
   * @param shouldUsePerSourceSubfolder If `true`, the NuGet Source name or URL is formatted
   * to a folder name and appended to the ROOT as a subfolder. Do not use
   * wildcards in ROOT with this set to `true`!
   * @param shouldUsePerPackageIdSubfolder  If `true`, the
   * {@link project}'s {@link NugetProjectProperties#PackageId}
   * is appended to the ROOT as a subfolder. Do not use wildcards in
   * ROOT with this set to `true`!
   * @returns A `dotnet nuget push` command line formatted with the
   * appropriate arguments.
   */
  GetPushCommand(
    options: typeof NRI.PushPackagesOptionsType.inferIn,
    shouldUsePerSourceSubfolder = false,
    shouldUsePerPackageIdSubfolder = false,
  ): string {
    const validOptions = NRI.PushPackagesOptionsType.from(options);
    type.boolean.assert(shouldUsePerSourceSubfolder);
    type.boolean.assert(shouldUsePerPackageIdSubfolder);

    validOptions.root = validOptions.root === '' ? `${cwd()}/publish` : validOptions.root;
    if (shouldUsePerSourceSubfolder)
      validOptions.root = node_path.join(validOptions.root, NugetRegistryInfo.GetDirNameForSource(this.source), node_path.sep);
    if (shouldUsePerPackageIdSubfolder)
      validOptions.root = node_path.join(validOptions.root, this._project.Properties.PackageId, node_path.sep);

    const packCommandArray: string[] = [
      'dotnet',
      'nuget',
      'push',
      `"${node_path.join(validOptions.root, '*.nupkg')}"`,
    ];

    if (this.resolvedEnvVariable)
      validOptions.apiKey ??= NRI._GetTokenValue(this.resolvedEnvVariable);
    /**
     * If apiKey is an empty string, defer to the dotnet CLI's NuGet client
     * ability to lookup API keys saved via `dotnet nuget add source` or NuGet config
     * files.
     */
    if (validOptions.apiKey && validOptions.apiKey !== '')
      packCommandArray.push('--api-key', validOptions.apiKey);
    if (validOptions.configFile)
      packCommandArray.push('--configfile', validOptions.configFile);
    if (validOptions.disableBuffering === true)
      packCommandArray.push('--disable-buffering');
    if (validOptions.forceEnglishOutput === true)
      packCommandArray.push('--force-english-output');
    if (validOptions.interactive === true)
      packCommandArray.push('--interactive');
    if (validOptions.noServiceEndpoint === true)
      packCommandArray.push('--no-service-endpoint');
    if (validOptions.noSymbols === true)
      packCommandArray.push('--no-symbols');
    if (validOptions.skipDuplicate === true)
      packCommandArray.push('--skip-duplicate');
    validOptions.source ??= this.source;
    packCommandArray.push('--source', validOptions.source);
    if (validOptions.symbolApiKey !== undefined)
      packCommandArray.push('--symbol-api-key', validOptions.symbolApiKey);
    if (validOptions.symbolSource !== undefined)
      packCommandArray.push('--symbol-source', validOptions.symbolSource);
    if (validOptions.timeout !== undefined)
      packCommandArray.push('--timeout', validOptions.timeout.toString());

    return packCommandArray.join(' ');
  }

  /**
   * Immediately push packages. The input path may be modified according to the
   * {@link shouldUsePerSourceSubfolder} and {@link shouldUsePerPackageIdSubfolder}
   * arguments.
   * @param options The `dotnet nuget push` command line options, including the
   * ROOT argument, the directory containing local nuget packages ready to be
   * pushed.
   * @param shouldUsePerSourceSubfolder If `true`, the NuGet Source name or URL is formatted
   * to a folder name and appended to the ROOT as a subfolder. Do not use
   * wildcards in ROOT with this set to `true`!
   * @param shouldUsePerPackageIdSubfolder If `true`, the current {@link project}'s
   * PackageId is appended to the ROOT as a subfolder. Do not use wildcards in
   * ROOT with this set to `true`!
   */
  // @ts-expect-error Todo: publicize to dismiss this "unused" error.
  private async _PushPackages(
    options: typeof NRI.PushPackagesOptionsType.inferIn,
    shouldUsePerSourceSubfolder = false,
    shouldUsePerPackageIdSubfolder = false,
  ) {
    try {
      await execAsync(
        this.GetPushCommand(
          options,
          shouldUsePerSourceSubfolder,
          shouldUsePerPackageIdSubfolder,
        ),
        true,
      );
    }
    catch (error: unknown) {
      const _error: Error = isError(error) ? error : new Error(JSON.stringify(error));
      throw options.apiKey
        ? _censorTokenInError(_error, options.apiKey)
        : _error;
    };

    // const pushOutput =.catch((error: unknown) => {
  }

  /**
   *
   * Get a `dotnet nuget push` command for pushing one or more nupkg/snupkg
   * files created by {@link GetPackCommand} or {@link _PackPackages}.\
   * Like {@link PackDummyPackage}, the output/ROOT path will include a
   * folder named after this NRI instance's {@link NugetRegistryInfo#source},
   * but will not include a subfolder for the
   * {@link NugetRegistryInfo#project NugetRegistryInfo.project}.{@link MSBuildProject#Properties Properties}.{@link MSBuildProject#Properties#PackageId PackageId}
   * @example
   * ```ts
   * const packAndPushDummyCmd = [
   *   nri.GetPackCommand(
   *     NugetRegistryInfo.PackPackagesOptionsType.from({ root: '' }),
   *     false,
   *     false,
   *   ),
   *   nri.GetPushDummyPackageCommand(pushOpts, false, false),
   * ].join(' && ')
   * ```
   * @param options options for `dotnet nuget push`. The following
   * fields are overwritten:
   * - root: getDummiesDir(this.project)
   * - skipDuplicates: true
   * @returns a `dotnet nuget push` command to push a dummy package
   * (created by executing {@link PackDummyPackage}) to {@link source}
   */
  GetPushDummyCommand(
    options: typeof NRI.PushDummyPackagesOptionsType.inferIn,
  ): string {
    return this.GetPushCommand(
      {
        ...NRI.PushDummyPackagesOptionsType.from(options),
        root: getDummiesDirectory(this._project),
      },
      true,
    );
  }

  /**
   * Call {@link GetPushDummyCommand} and immediately execute it.
   * @throws {Error} when the process exits with an error code indicating
   * failure i.e. the command line is invalid, the process fails to start,
   * the push fails, et cetera.
   * @param options the ROOT arg and options for `dotnet nuget push`. The following
   * fields are overwritten:
   * - root: getDummiesDir(this.project)
   * - skipDuplicates: true
   * @returns The return type of {@link execAsync} i.e. a {@link Promise} resolving to `{ stdout: string; stderr: string }`.
   */
  private async _PushDummyPackages(
    options: typeof NRI.PushDummyPackagesOptionsType.inferIn,
  ): ReturnType<typeof execAsync> {
    const pushCommand: string = this.GetPushDummyCommand(options);
    try {
      return await execAsync(pushCommand, true);
    }
    catch (error: unknown) {
      const _error: Error = isError(error) ? error : new Error(String(error));
      throw options.apiKey
        ? _censorTokenInError(_error, options.apiKey)
        : _error;
    }
  }

  // #endregion Push

  // if non-exact-match is needed, learn how to make a parameter-driven type.
  private static readonly _NugetSearchReturnTypes = {
    ExactMatch: {
      v2: type({
        version: '2',
        problems: 'unknown[]',
        searchResult: [
          {
            sourceName: 'string',
            packages: type({
              id: 'string',
              version: type.keywords.string.semver,
            }).array(),
          },
        ],
      }),
    },
  };

  private static readonly _ParseNugetSearchReturn = type(
    'string.json.parse',
  ).to(this._NugetSearchReturnTypes.ExactMatch.v2);

  /**
   * !WARNING: this method requires the Nuget Source to be configured via `dotnet nuget add source` or `dotnet nuget update source`. `NUGET_TOKEN` works, but it may be vulnerable to supply chain attacks.\
   * Call during the `prepare` step of a Semantic Release run.\
   * Determine if the `nextVersion` generated during the `analyze` Semantic
   * Release step was already published to the NuGet {@link source}.
   * @param source The name or URI of the NuGet Source to search. If this API
   * endpoint does not support searches, the operation will fail. If this API
   * endpoint requires authentication (e.g. GitHub), it must be configured via
   * `dotnet nuget add source` or `dotnet nuget update source` before calling
   * this method.
   * @param packageId The ID of the NuGet package to search for.
   * @param nextVersion The nextVersion value generated by semantic-release's hidden ["Create Git tag" step](https://semantic-release.gitbook.io/semantic-release#:~:text=the%20last%20release.-,Create%20Git%20tag,-Create%20a%20Git).
   * @returns A promised boolean.
   * If the promise resolves to `true`, the semantic release run should be
   * cancelled immediately.
   * Otherwise, the release should proceed.
   * @todo utilize in custom plugin inserted at the beginning of `prepare`
   */
  static async IsNextVersionAlreadyPublished(
    source: string,
    packageId: string,
    nextVersion: string,
  ): Promise<boolean> {
    if (nextVersion === '')
      throw new Error('The value of nextVersion is empty');
    const stdPair = await execAsync(
      `dotnet package search --format JSON --exact-match --source ${source} --prerelease ${packageId}`,
      true,
    );
    const json = stdPair.stdout;
    const errsOrObject = this._ParseNugetSearchReturn(json);
    const _object = errsOrObject instanceof type.errors ? errsOrObject.throw() : errsOrObject;
    const results = _object.searchResult;
    const packages = results[0].packages;
    const package_ = packages.find(p => p.version === type('string.semver').from(nextVersion));
    return package_ !== undefined;
  }

  /**
   * !WARNING: GITHUB_OUTPUT must be the full path to an environment file.
   * The plugin "semantic-release-output-variables" next-release-version
   *
   * !WARNING: NuGet Source API Key mus tbe configured via `dotnet nuget add source` or `dotnet nuget update source`.
   * Some Sources (e.g. GitHub) require authentication for package searches.
   *
   * # Authenticating NuGet Package Searches
   *
   * ## GitHub NuGet Registry authentication
   * - {@link https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry#authenticating-in-a-github-actions-workflow Authenticating in a GitHub Actions workflow}
   * - {@link https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry#authenticating-with-a-personal-access-token Authenticating with a personal access token}.
   * ## For GitLab NuGet Registry authentication, see
   * - {@link https://docs.gitlab.com/ee/user/packages/nuget_repository/#add-a-source-with-the-net-cli Add a source with the .NET CLI}
   * @returns a string containing a Node.JS command line invoking {@link ./IsNextVersionAlreadyPublished.cli.ts}
   * @see {@link ./IsNextVersionAlreadyPublished.cli.ts}, {@link ./IsNextVersionAlreadyPublished.cli.js}
   */
  GetIsNextVersionAlreadyPublishedCommand(): string {
    // if GITHUB_OUTPUT unset or its file does not exist, create it. ''
    getGithubOutputSync();
    // The script will run
    return `node ${node_path.join(import.meta.dirname, './IsNextVersionAlreadyPublished.cli.js')} --packageId ${this._project.Properties.PackageId} --source ${this.source}`;
  }

  /*
   * Copy https://github.com/joelharkes/nuget-push when we split off our dotnet
   * modules to a semantic-release plugin.
   */

  /*
   * If you want a deterministic nupkg, do so with a custom MSBuild target with
   * AfterTargets="Pack" to restore and execute the dotnet tool "Kuinox.NupkgDeterministicator" .
   */
}

// shorthand/alias for NugetRegistryInfo
const NRI: typeof NugetRegistryInfo = NugetRegistryInfo;

/**
 * The base type for {@link NRIOpts} and related types. Extend this type while
 * overriding member types via {@link NRIOptsBase.merge}
 */
// eslint-disable-next-line unicorn/name-replacements
export const NRIOptsBase: Type<{
  project: MSBuildProject | {
    readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
    readonly Properties: Readonly<NugetProjectProperties>;
    readonly Targets: readonly string[];
    readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];
  };
  source: string;
  tokenEnvVars: readonly string[];
}> = type({
  /**
   * The environment variables whose values are tokens with permission to push a
   * package to the NuGet package registry. The array is iterated through until
   * one token is found. If none of the environment variables are defined,
   * {@link NugetRegistryInfo}'s constructor will throw an {@link Error}.
   */
  project: type
    .instanceOf(MSBuildProject)
    .or(type.instanceOf(MSBuildProject).readonly()),
  /**
   * A NuGet package registry's API endpoint URL -OR- the name assigned via the
   * client e.g. `dotnet nuget add source --name ${source} ${source's URL}`
   */
  source: type.string,
  /**
   * WARNING: If possible, set credentials via `dotnet nuget {add|update}
   * source` as recommended by Microsoft! This is more secure than exposing
   * credentials to the Node.JS runtime and all its loaded modules.
   *
   * The environment variables whose values are tokens with permission to push a
   * package to the NuGet package registry.The array is iterated through until
   * one token is found.If none of the environment variables are defined,
   * {@link NugetRegistryInfo}'s constructor will throw an {@link Error}.
   *
   * If none of these are defined in the `.env` or process environment variables (.vault.env is impractical in CI), the `--api-key/-k` argument is excluded from `dotnet nuget push` commands.
   * Instead, the NuGet client relies on credentials configured for the
   * given NuGet source. If the NuGet client does not find credentials saved for the
   * NuGet {@link NRIOptsBase.t.source source} and they are required, the command will fail.
   *
   * Use the `dotnet` CLI to configure credentials for existing NuGet sources
   * ({@link https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-nuget-update-source `dotnet nuget update source`})
   * -OR- configure credentials for non-default NuGet sources
   * ({@link https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-nuget-add-source `dotnet nuget add source`}).\
   * Alternatively, use the `nuget.exe` CLI to add/update sources. See
   * {@link https://learn.microsoft.com/en-us/nuget/reference/cli-reference/cli-ref-sources `nuget sources` (NuGet CLI)}.
   *
   * The credentials will be validated during the `verifyConditions` step of Semantic Release.
   */
  tokenEnvVars: type.string.array().readonly(),
});

/**
 * The type of the parameter for {@link NugetRegistryInfo}'s constructor.
 */
// eslint-disable-next-line unicorn/name-replacements
export const NRIOpts: Type<{
  project: MSBuildProject | {
    readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
    readonly Properties: Readonly<NugetProjectProperties>;
    readonly Targets: readonly string[];
    readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];
  };
  tokenEnvVars: Default<readonly string[], readonly ['NUGET_TOKEN']>;
  source: Default<string, string>;
}> = NRIOptsBase.merge({
  /**
   * Defaults to {@link NugetRegistryInfo.DefaultTokenEnvVars}
   * @see {@link NRIOptsBase.t.tokenEnvVars}
   */
  tokenEnvVars: NRIOptsBase.get('tokenEnvVars').default(
    () => NugetRegistryInfo.DefaultTokenEnvVars,
  ),
  /**
   * A NuGet package registry's API endpoint URL -OR- the name assigned to it
   * via your NuGet client.
   * @default 'https://api.nuget.org/v3/index.json' (name: 'nuget.org')
   * @see {@link NRIOptsBase.t.source}
   */
  source: NRIOptsBase.get('source').default(() => defaultNugetSource),
});

// #region token censorship

/**
 * Replace all occurrences of {@link token} in the {@link string} with '***'.
 * @param string The string in which a {@link token} may be found.
 * @param token The NuGet API token you definitely don't want to leak!
 * @returns A modified copy of the {@link string} with all occurrences of the
 * {@link token} replaced with '***'.
 */
function _censorToken(string: string, token: string): string {
  return string.replaceAll(token, '***');
}

/**
 * Censor all occurrences of an API {@link token} in an {@link error}.
 * @param error A {@link ExecException} in which the NuGet API {@link token} may be found.
 * @param token The value of the NuGet API token
 * @returns A modified copy of the provided exception sans any occurrence of the
 * NuGet API token.
 */
function _censorTokenInError(error: ExecException, token: string): ExecException {
  const text = JSON.stringify({
    ...error,
    message: error.message,
    stack: error.stack,
  });
  return Object.assign(
    error,
    JSON.parse(
      _censorToken(
        text,
        token,
      ),
    ) as ExecException,
  );
}

// #endregion token censorship
