import { type } from 'arktype'
import { detectFile, detectFileSync } from 'chardet'
import { configDotenv } from 'dotenv'
import { ok } from 'node:assert/strict'
import { exec, fork } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import node_path, { resolve } from 'node:path'
import { cwd, env } from 'node:process'
import { promisify } from 'node:util'
import { isNativeError } from 'node:util/types'
import { getEnvVarValue } from '../envUtils.js'
import { MSBuildProject } from './MSBuildProject.js'

/* JSDoc Types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NugetProjectProperties } from './NugetProjectProperties.js'
import type { SemanticReleaseConfigDotnet } from '../semanticReleaseConfigDotnet.js'
/* eslint-enable @typescript-eslint/no-unused-vars */

const execAsync = promisify(exec)
const tmpDirNamespace = resolve(tmpdir(), 'HCE.Shared', '.NET', 'Dummies')
const defaultNugetSource = 'https://api.nuget.org/v3/index.json'

/**
 * Read the contents of $GITHUB_OUTPUT (if its value is a file path) or $TEMP/GITHUB_OUTPUT.
 * If the file doesn't exist, it is created.
 */
export async function getGithubOutput() {
  if (env.GITHUB_OUTPUT === undefined || !existsSync(env.GITHUB_OUTPUT)) {
    const githubOutputPath: string = node_path.join(tmpdir(), 'GITHUB_OUTPUT')
    if (!existsSync(githubOutputPath))
      await writeFile(githubOutputPath, '')
    env.GITHUB_OUTPUT = githubOutputPath
  }

  const encoding = await detectFile(env.GITHUB_OUTPUT)
  const envOutput = configDotenv({
    path: env.GITHUB_OUTPUT,
    override: true,
    encoding: encoding ?? undefined,
    processEnv: {},
  })

  if (isNativeError(envOutput.error))
    throw envOutput.error
  return envOutput.parsed
}

/**
 * Read the contents of $GITHUB_OUTPUT (if its value is a file path) or $TEMP/GITHUB_OUTPUT.
 * If the file doesn't exist, it is created.
 */
export function getGithubOutputSync(): ReturnType<typeof configDotenv>['parsed'] {
  if (env.GITHUB_OUTPUT === undefined || !existsSync(env.GITHUB_OUTPUT)) {
    const githubOutputPath: string = node_path.join(tmpdir(), 'GITHUB_OUTPUT')
    if (!existsSync(githubOutputPath))
      writeFileSync(githubOutputPath, '')
    env.GITHUB_OUTPUT = githubOutputPath
  }

  const encoding = detectFileSync(env.GITHUB_OUTPUT)
  const envOutput = configDotenv({
    path: env.GITHUB_OUTPUT,
    override: true,
    encoding: encoding ?? undefined,
    processEnv: {},
  })

  if (isNativeError(envOutput.error))
    throw envOutput.error
  return envOutput.parsed
}

/**
 * Get HCE.Shared's temporary directory for .NET projects' dummy packages.
 * @param project The MSBuild project whose PackageId will be used to create a
 * directory for its dummy packages.
 * @returns a platform-specific path like
 * `${tmpdir()}/HCE.Shared/.NET/Dummies/${project.Properties.PackageId}` if
 * {@link project} is defined. Else `${tmpdir()}/HCE.Shared/.NET/Dummies`
 */
function getDummiesDir(project?: MSBuildProject): string {
  return project !== undefined
    ? resolve(tmpDirNamespace, project.Properties.PackageId)
    : tmpDirNamespace
}

export class NugetRegistryInfo {
  private _canPushPackagesToUrl: Promise<true> | undefined = undefined
  private readonly _resolvedEnvVariable: string
  private readonly _url: string

  public static readonly DefaultTokenEnvVars: readonly ['NUGET_TOKEN'] = Object.freeze(
    ['NUGET_TOKEN'] as const,
  )

  private static _parseStdoutForNupkgs(stdout: string): string[] {
    return stdout
      .replace('\r', '')
      .split('\n')
      .filter(line => line.endsWith(`.nupkg'.`) || line.endsWith(`.snupkg'.`))
      // remove everything up to and including the first apostrophe.
      // Pray no cultures add another apostrophe before the path.
      .map(line => line.replace(/^[^']+'/, ''))
      // trim the apostrophe and period from the end of the string.
      .map(line => line.replace(`'.`, ''))
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
   * @param url The URL of the NuGet Source
   * @returns A string suitable for a local filesystem folder name, formatted as
   * `${hostname}_${pathname.replace('/', '_')}`.
   */
  static GetNameForURL(url: string) {
    const _url = new URL(url)
    return `${_url.hostname}_${_url.pathname.replace('/', '_')}`
  }

  /**
   * Creates an instance of NugetRegistryInfo.\
   * This class enables the ability to push a given {@link project}'s
   * package(s) to the {@link url} of a given NuGet Source's API endpoint with
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
   * @constructor
   * @param {typeof NRIOpts['inferIn']} opts The input type of {@link NugetRegistryInfoOptions.from}
   * @param {MSBuildProject} opts.project The project whose package(s) will be
   * pushed.\
   * - Its {@link NugetProjectProperties#PackageId} will be read.\
   * - Its {@link NugetProjectProperties#PackageVersion} will be overridden via CLI args when creating a dummy package. The real package's
   * `PackageVersion` will *not* be overridden.
   * @param {readonly string[]} [opts.tokenEnvVars=NugetRegistryInfo.DefaultTokenEnvVars] The environment variables
   * whose values are tokens with permission to push a package to the NuGet
   * package registry. The array is iterated through until one token is found.
   * If none of the environment variables are defined, this constructor will
   * throw an {@link Error}.
   * @param {string} [opts.url=defaultNugetSource]
   */
  constructor(opts: typeof NRIOpts['inferIn']) {
    // note: you can reassign `opts` only when typeof `inferOut` is assignable
    // to typeof `inferIn`.
    const validOpts = NRIOpts.from(opts)
    this._project = validOpts.project
    /**
     * May throw! Assign key of the first key-value pair to
     * {@link resolvedEnvVariable}
     */
    this._resolvedEnvVariable = _GetTokenEnvVariables(validOpts.tokenEnvVars)[0][0]
    this._url = validOpts.url

    /**
     * Get the environment variables as key-value pairs.
     * @param tokenEnvVars The name of the environment variables whose values are
     * NuGet API keys.
     * @returns an array of key-value pairs of the given environment variables and
     * their values, filtered to only those whose values are not undefined.
     * @throws {Error} when none of the provided environment variables are defined.
     */
    function _GetTokenEnvVariables(tokenEnvVars: readonly string[]): readonly [string, string][] {
      const definedTokens = Object.freeze(
        tokenEnvVars.map(
          // key-value tuple
          key => [key, getEnvVarValue(key)] as const,
        ).filter(
          (pair: readonly [string, string | undefined]): pair is [string, string] =>
            pair[1] !== undefined,
        ),
      )

      if (definedTokens.length !== 0)
        return definedTokens

      throw new Error(`The environment variables [${tokenEnvVars.join(', ')}] were specified as the source of the token to push a NuGet package to GitHub, but no tokens were defined.`)
    }
  }

  private readonly _project: MSBuildProject
  public get project(): MSBuildProject { return this._project }

  /**
   * This is not useful without it being executed as part of a Semantic Release
   * plugin. Deferring this to @semantic-release/exec's prepareCmd is possible,
   * but impractical. You'd need to configure prepareCmd to invoke something
   * like `node customScriptFile.mjs`. It's not worth the hassle.
   * @returns `true` if the token can be used to push nupkg to the given Nuget registry
   * @throws
   * - {@link ReferenceError} when NugetRegistryInfo.resolvedVariable is null or undefined
   * - {@link TypeError} when the environment variable {@link NugetRegistryInfo.resolvedEnvVariable} is undefined
   * - {@link Error}
   *   - The token is invalid, of the wrong token type, or lacks permission to push packages
   *   - The URL does not exist or a connection could not be established
   * @type {Promise<true>}
   * @remarks Semantic Release Step: Beginning of `prepare`
   * @deprecated
   */
  // @ts-expect-error ts(6133): 'canPushPackagesToUrl' is declared but its value is never read.
  private get canPushPackagesToUrl(): Promise<true> {
    if (this._canPushPackagesToUrl !== undefined)
      return this._canPushPackagesToUrl

    const tokenValue = NRI._GetTokenValue(this.resolvedEnvVariable)

    if (tokenValue.startsWith('github_pat_')) {
      const errMsg = `The value of the token in ${this.resolvedEnvVariable} begins with 'github_pat_', indicating it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`
      const err = new Error(errMsg)
      return this._canPushPackagesToUrl = Promise.reject(err)
    }

    return this._canPushPackagesToUrl = this.PackDummyPackage({})
      .then(async () => await this._PushDummyPackages({
        // todo: This is redundant. Make copy of PushPackagesOptionsType with readonly `root` for use by `_PushDummyPackages`, `GetPushDummyCommand`
        root: getDummiesDir(this.project),
        apiKey: getEnvVarValue(this.resolvedEnvVariable),
      }))
      .then<true>((execAsyncReturn) => {
        ok(execAsyncReturn)
        return true as const
      })
  }

  /**
   * The first environment variable found to have a defined value.
   *
   * @readonly
   * @type {string}
   */
  get resolvedEnvVariable() { return this._resolvedEnvVariable }
  get url() { return this._url }

  /**
   * Get the API token from {@link NugetRegistryInfo#resolvedEnvVariable}
   * @param tokenEnvVar The name of the environment variable(s) whose value is a NuGet API key.
   * @returns The value of the first defined environment variable.
   * @throws {Error} when none of the provided environment variables are defined.
   */
  private static _GetTokenValue(resolvedEnvVariable: string): string {
    type.string.assert(resolvedEnvVariable)

    const tokenValue = getEnvVarValue(resolvedEnvVariable)
    if (tokenValue === undefined) {
      throw new Error(`\
The environment variable ${resolvedEnvVariable} was specified \
as the source of the token to push a NuGet package, \
but the environment variable is empty or undefined.`)
    }
    return tokenValue
  }

  // #region Pack

  /**
   * The type for options and arguments of `dotnet pack`. See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-pack.
   */
  static readonly PackPackagesOptionsType = Object.freeze(type({
    artifactsPath: 'string',
    configuration: '"Release" | "Debug"',
    disableBuildServers: 'boolean',
    force: 'boolean',
    includeSource: 'boolean',
    includeSymbols: 'boolean',
    interactive: 'boolean',
    noBuild: 'boolean',
    noLogo: 'boolean',
    noRestore: 'boolean',
    output: 'string',
    runtime: 'string',
    serviceable: 'boolean',
    terminalLogger: '"auto" | "on" | "off"',
    useCurrentRuntime: 'boolean',
    verbosity: '"quiet" | "minimal" | "normal" | "detailed" | "diagnostic"',
    versionSuffix: 'string',
  }).partial())

  /**
   * Get a `dotnet pack` command line string, outputting the package(s) to a
   * path determined by this method's parameters.
   * When pushing the package(s), you only need to supply the main .nupkg's path
   * or its directory to the dotnet CLI—by default, it will also push the
   * symbols package, if present.
   * @param {typeof NRI.PackPackagesOptionsType.t} opts Options passed to
   * `dotnet pack`, excluding the required `<PROJECT | SOLUTION>` argument. The
   * {@link PackPackagesOptionsType.t.output} path is modified according to the
   * {@link usePerSourceSubfolder} and {@link usePerPackageIdSubfolder} arguments.
   * @returns `dotnet pack "${this.project.Properties.MSBuildProjectFullPath}"
   * -o "${outDir}"` where outDir may be `${cwd()}/publish/${NugetRegistryInfo.GetNameForURL(this.url)}/${this._project.Properties.PackageId}`
   */
  GetPackCommand(
    opts: typeof NRI.PackPackagesOptionsType.t,
    usePerSourceSubfolder = false,
    usePerPackageIdSubfolder = false,
  ): string {
    NRI.PackPackagesOptionsType.assert(opts)
    type.boolean.assert(usePerSourceSubfolder)
    type.boolean.assert(usePerPackageIdSubfolder)

    opts.output ??= `${cwd()}/publish`
    if (usePerSourceSubfolder === true)
      opts.output = resolve(opts.output, NugetRegistryInfo.GetNameForURL(this.url))
    if (usePerPackageIdSubfolder)
      opts.output = resolve(opts.output, this._project.Properties.PackageId)

    const packCmdArr: string[] = [
      'dotnet',
      'pack',
      `"${this._project.Properties.MSBuildProjectFullPath}"`,
      '-o',
      `"${opts.output}"`,
    ]
    if (opts.artifactsPath !== undefined)
      packCmdArr.push('--artifactsPath', `"${opts.artifactsPath}"`)
    if (opts.configuration !== undefined)
      packCmdArr.push('--configuration', opts.configuration)
    if (opts.disableBuildServers === true)
      packCmdArr.push('--disable-build-servers')
    if (opts.force === true)
      packCmdArr.push('--force')
    if (opts.includeSource === true)
      packCmdArr.push('--include-source')
    if (opts.includeSymbols === true)
      packCmdArr.push('--include-symbols')
    if (opts.interactive === true)
      packCmdArr.push('--interactive')
    if (opts.noBuild === true)
      packCmdArr.push('--no-build')
    if (opts.noLogo === true)
      packCmdArr.push('--nologo')
    if (opts.noRestore === true)
      packCmdArr.push('--no-restore')
    if (opts.runtime !== undefined)
      packCmdArr.push('--runtime', opts.runtime)
    if (opts.serviceable === true)
      packCmdArr.push('--serviceable')
    if (opts.terminalLogger !== undefined)
      packCmdArr.push('--tl', opts.terminalLogger)
    if (opts.useCurrentRuntime === true)
      packCmdArr.push('--use-current-runtime')
    if (opts.verbosity !== undefined)
      packCmdArr.push('--verbosity', opts.verbosity)
    if (opts.versionSuffix !== undefined)
      packCmdArr.push('--version-suffix', opts.versionSuffix)

    return packCmdArr.join(' ')
  }

  /**
   * !Not ready for use! Remove private modifier and commit as `feat(dotnet)` when ready for release!
   * Blocking Issue: convert all dotnet-related functionality to a Semantic Release plugin!
   * The current {@link SemanticReleaseConfigDotnet} leverages
   * `@semantic-release/exec` to invoke dotnet commands. This is fine for
   * relatively short command lines, but chaining commands with ' && ' results
   * in quickly-growing complexity.
   * NuGet packages should be created during the `prepare` step, but complex
   * configuration of `dotnet pack` via command lines intended to be invoked by
   * `@semantic-release/exec` is impractical.
   * @param opts `dotnet pack` options. See `dotnet pack -h`,
   * https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-pack, and
   * {@link PackPackagesOptionsType}.
   * @param [usePerSourceSubfolder=false] If `true`, modify the output path to
   * include a subfolder bearing a path-safe encoding of the NuGet Source that
   * will receive the nupkg.
   * @param [usePerPackageIdSubfolder=false] If `true`, modify the output path
   * to include a subfolder named after the the PackageId.
   * @returns a string[] containing the full file paths of all new packages i.e.
   * .nupkg, .symbols.nupkg, .snupkg
   */
  private async _PackPackages(
    opts: typeof NRI.PackPackagesOptionsType.t,
    usePerSourceSubfolder = false,
    usePerPackageIdSubfolder = false,
  ): Promise<string[]> {
    NRI.PackPackagesOptionsType.assert(opts)
    type.boolean.assert(usePerSourceSubfolder)
    type.boolean.assert(usePerPackageIdSubfolder)

    const packOutput = await execAsync(this.GetPackCommand(
      opts,
      usePerSourceSubfolder,
      usePerPackageIdSubfolder,
    ))
    return NugetRegistryInfo._parseStdoutForNupkgs(packOutput.stdout)
  }

  /**
   * Create a dummy package for the current {@link project} by executing a
   * command line like \``dotnet pack ${this.project.Properties.MSBuildProjectFullPath} -p:Version=0.0.1-DUMMY -output ${getDummiesDir(this._project)}/${GetNameForURL(this.url)}`\`
   * @param {typeof NRI.PackPackagesOptionsType.t} opts Options passed to
   * `dotnet pack`, excluding the required `<PROJECT | SOLUTION>` argument.
   * - The `output` field is ignored and overwritten. It is replaced with
   *   ${{@link getDummiesDir}({@link project})}/${{@link GetNameForURL}({@link url})}
   * - The `output` path will be affixed with a folder named after this
   * {@link NugetRegistryInfo#url}, but will not include a subfolder for the
   * {@link NugetRegistryInfo#project NugetRegistryInfo.project}.{@link MSBuildProject#Properties Properties}.{@link MSBuildProject#Properties#PackageId PackageId}.
   * @returns the full paths of all nupkg, symbols.nupkg, and snupkg files
   * created by the Pack target, as extracted from the dotnet process's STDOUT.
   * If mixed with other nupkgs, filter for the {@link NugetProjectProperties#PackageId}
   */
  public async PackDummyPackage(
    opts: typeof NRI.PackPackagesOptionsType.t,
  ): Promise<string[]> {
    NRI.PackPackagesOptionsType.assert(opts)

    opts.output = getDummiesDir(this._project)
    const packCmd: string = this.GetPackCommand(opts, true)
    /** e.g.
     * ```txt
     *  Determining projects to restore...
     *  All projects are up-to-date for restore.
     *  GroupBox.Avalonia -> C:\Repos\BinToss\GroupBox.Avalonia\GroupBox.Avalonia\bin\Release\net6.0\GroupBox.Avalonia.dll
     *  Successfully created package 'C:\Users\Noah\AppData\Local\Temp\HCE.Shared\.NET\Dummies\api.nuget.org_v3_index.json\BinToss.GroupBox.Avalonia\BinToss.GroupBox.Avalonia.1.1.0-alpha.53.nupkg'.
     *  Successfully created package 'C:\Users\Noah\AppData\Local\Temp\HCE.Shared\.NET\Dummies\api.nuget.org_v3_index.json\BinToss.GroupBox.Avalonia\BinToss.GroupBox.Avalonia.1.1.0-alpha.53.snupkg'.
     * ```
     */
    const packOutput = await execAsync(`${packCmd} -p:Version=0.0.1-DUMMY`)
    return NugetRegistryInfo._parseStdoutForNupkgs(packOutput.stdout)
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
  static readonly PushPackagesOptionsType = Object.freeze(type({
    apiKey: 'string',
    disableBuffering: 'boolean',
    forceEnglishOutput: 'boolean',
    interactive: 'boolean',
    noServiceEndpoint: 'boolean',
    noSymbols: 'boolean',
    skipDuplicate: 'boolean',
    source: 'string',
    symbolApiKey: 'string',
    symbolSource: 'string',
    timeout: 'number',
  }).partial().and({
    root: 'string',
  }))

  /**
   * Create a `dotnet nuget push` command line from the given options and
   * optional boolean parameters.
   * @param opts See {@link PushPackagesOptionsType}
   * @param usePerSourceSubfolder If `true`, the NuGet Source URL is formatted
   * to a folder name and appended to the ROOT as a subfolder. Do not use
   * wildcards in ROOT with this set to `true`!
   * @param usePerPackageIdSubfolder  If `true`, the
   * {@link project}'s {@link NugetProjectProperties#PackageId}
   * is appended to the ROOT as a subfolder. Do not use wildcards in
   * ROOT with this set to `true`!
   * @returns A `dotnet nuget push` command line formatted with the
   * appropriate arguments.
   */
  GetPushCommand(
    opts: typeof NRI.PushPackagesOptionsType.t,
    usePerSourceSubfolder = false,
    usePerPackageIdSubfolder = false,
  ): string {
    NRI.PushPackagesOptionsType.assert(opts)
    type.boolean.assert(usePerSourceSubfolder)
    type.boolean.assert(usePerPackageIdSubfolder)

    opts.root ??= `${cwd()}/publish`
    if (usePerSourceSubfolder === true)
      opts.root = resolve(opts.root, NugetRegistryInfo.GetNameForURL(this.url))
    if (usePerPackageIdSubfolder)
      opts.root = resolve(opts.root, this._project.Properties.PackageId)

    const packCmdArr: string[] = [
      'dotnet',
      'push',
      `"${opts.root}"`,
    ]
    /**
     * If apiKey is an empty string, defer to the dotnet CLI's NuGet client
     * ability to lookup API keys saved via `dotnet nuget add source` or NuGet config
     * files.
     */
    if ((opts.apiKey ??= NRI._GetTokenValue(this.resolvedEnvVariable)) !== undefined
      && opts.apiKey !== '')
      packCmdArr.push('--api-key', `"${opts.apiKey}"`)
    if (opts.disableBuffering === true)
      packCmdArr.push('--disable-buffering')
    if (opts.forceEnglishOutput === true)
      packCmdArr.push('--force-english-output')
    if (opts.interactive === true)
      packCmdArr.push('--interactive')
    if (opts.noServiceEndpoint === true)
      packCmdArr.push('--no-service-endpoint')
    if (opts.noSymbols === true)
      packCmdArr.push('--no-symbols')
    if (opts.skipDuplicate === true)
      packCmdArr.push('--skip-duplicate')
    if ((opts.source ??= this.url) !== undefined)
      packCmdArr.push('--source', opts.source)
    if (opts.symbolApiKey !== undefined)
      packCmdArr.push('--symbol-api-key', opts.symbolApiKey)
    if (opts.symbolSource !== undefined)
      packCmdArr.push('--symbol-source', opts.symbolSource)
    if (opts.timeout !== undefined)
      packCmdArr.push('--timeout', opts.timeout.toString())

    return packCmdArr.join(' ')
  }

  /**
   * Immediately push packages. The input path may be modified according to the
   * {@link usePerSourceSubfolder} and {@link usePerPackageIdSubfolder}
   * arguments.
   * @param opts The `dotnet nuget push` command line options, including the
   * ROOT argument, the directory containing local nuget packages ready to be
   * pushed.
   * @param usePerSourceSubfolder If `true`, the NuGet Source URL is formatted
   * to a folder name and appended to the ROOT as a subfolder. Do not use
   * wildcards in ROOT with this set to `true`!
   * @param usePerPackageIdSubfolder If `true`, the current {@link project}'s
   * PackageId is appended to the ROOT as a subfolder. Do not use wildcards in
   * ROOT with this set to `true`!
   */
  // @ts-expect-error Todo: add tests and/or publicize to dismiss this "unused" error.
  private async _PushPackages(
    opts: typeof NRI.PushPackagesOptionsType.t,
    usePerSourceSubfolder = false,
    usePerPackageIdSubfolder = false,
  ) {
    // const pushOutput =
    await execAsync(this.GetPushCommand(
      opts,
      usePerSourceSubfolder,
      usePerPackageIdSubfolder,
    ))
  }

  /**
   *
   * Get a `dotnet nuget push` command for pushing one or more nupkg/snupkg
   * files created by {@link GetPackCommand} or {@link _PackPackages}.\
   * Like {@link PackDummyPackage}, the output/ROOT path will include a
   * folder named after this NRI instance's {@link NugetRegistryInfo#url},
   * but will not include a subfolder for the
   * {@link NugetRegistryInfo#project NugetRegistryInfo.project}.{@link MSBuildProject#Properties Properties}.{@link MSBuildProject#Properties#PackageId PackageId}
   *
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
   *
   * @public
   * @param opts the ROOT arg and options for `dotnet nuget push`. The following
   * fields are overwritten:
   * - root: getDummiesDir(this.project)
   * - skipDuplicates: true
   * @returns {string} a `dotnet nuget push` command to push a dummy package
   * (created by executing {@link PackDummyPackage}) to {@link url}
   */
  GetPushDummyCommand(opts: typeof NRI.PushPackagesOptionsType.t): string {
    opts.root = getDummiesDir(this.project)
    opts.skipDuplicate = true
    return this.GetPushCommand(opts, true)
  }

  /**
   * Call {@link GetPushDummyCommand} and immediately executes it.\
   * @throws {Error} when the process exits with an error code indicating
   * failure i.e. the command line is invalid, the process fails to start,
   * the push fails, et cetera.
   * @param opts the ROOT arg and options for `dotnet nuget push`. The following
   * fields are overwritten:
   * - root: getDummiesDir(this.project)
   * - skipDuplicates: true
   */
  private async _PushDummyPackages(opts: typeof NRI.PushPackagesOptionsType.t): Promise<{ stdout: string, stderr: string }> {
    const pushCmd: string = this.GetPushDummyCommand(opts)
    return await execAsync(pushCmd)
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
  }

  private static readonly _ParseNugetSearchReturn = type('string.json.parse').to(this._NugetSearchReturnTypes.ExactMatch.v2)

  /**
   * !WARNING: this method requires the Nuget Source to be configured via `dotnet nuget add source` or `dotnet nuget update source`. If your publish pipeline only pushes to one NuGet Source and you're especially lazy, you can assign the API token to NUGET_TOKEN.
   * @param source The name or URI of the NuGet Source to search. If this API
   * endpoint does not support searches, the operation will fail. If this API
   * endpoint requires authentication (e.g. GitHub), it must be configured via
   * `dotnet nuget add source` or `dotnet nuget update source` before calling
   * this method.
   * @param packageId The ID of the NuGet package to search for.
   * @param nextVersion The nextVersion value generated by semantic-release's hidden ["Create Git tag" step](https://semantic-release.gitbook.io/semantic-release#:~:text=the%20last%20release.-,Create%20Git%20tag,-Create%20a%20Git).
   * @todo utilize in custom plugin inserted at the beginning of `prepare`
   * @deprecated NOT IMPLEMENTED
   */
  static async IsNextVersionAlreadyPublished(source: string, packageId: string, nextVersion: string): Promise<boolean> {
    if (nextVersion === '')
      throw new Error('The value of nextVersion is empty')
    return await execAsync(`dotnet package search --format JSON --exact-match --source ${source} --prerelease ${packageId}`)
      .then(stdPair => stdPair.stdout)
      .then(json => this._ParseNugetSearchReturn(json))
      .then((errsOrObj) => {
        if (errsOrObj instanceof type.errors)
          throw errsOrObj.throw()
        return errsOrObj
      })
      .then(obj => obj.searchResult)
      .then(results => results[0].packages)
      .then(pkgs => pkgs.find(p => p.version === type('string.semver').from(nextVersion)))
      .then(pkg => pkg === undefined ? false : true)
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
   *
   * @experimental
   * @see {@link ./IsNextVersionAlreadyPublished.cli.ts}, {@link ./IsNextVersionAlreadyPublished.cli.js}
   */
  GetIsNextVersionAlreadyPublishedCommand(): string {
    // if GITHUB_OUTPUT unset or its file does not exist, create it. ''
    getGithubOutputSync()
    // The script will run
    return `node ${node_path.join(import.meta.dirname, './IsNextVersionAlreadyPublished.cli.js')} --packageId ${this._project.Properties.PackageId} --url ${this.url}`
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
const NRI = NugetRegistryInfo

/**
 * The base type for {@link NugetRegistryInfoOptions} and related types. Extend
 * this type while overriding member types via {@link NugetRegistryInfoOptionsBase.merge}
 */
export const NugetRegistryInfoOptionsBase = type({
  /**
   * The environment variables whose values are tokens with permission to push a
   * package to the NuGet package registry. The array is iterated through until
   * one token is found. If none of the environment variables are defined,
   * {@link NugetRegistryInfo}'s constructor will throw an {@link Error}.
   */
  project: type.instanceOf(MSBuildProject),
  /**
   * The environment variables whose values are tokens with permission to push a
   * package to the NuGet package registry.The array is iterated through until
   * one token is found.If none of the environment variables are defined,
   * {@link NugetRegistryInfo}'s constructor will throw an {@link Error}.
   */
  tokenEnvVars: type.string.array().readonly(),
  /** A NuGet package registry's API endpoint URL. */
  url: type.string,
})
const NRIOptsBase = NugetRegistryInfoOptionsBase

/**
 * The type of the parameter for {@link NugetRegistryInfo}'s constructor.
 * url: A NuGet package registry's API endpoint URL.. Default: https://api.nuget.org/v3/index.json
 */
export const NugetRegistryInfoOptions = NRIOptsBase.merge({
  /**
   * Defaults to {@link NugetRegistryInfo.DefaultTokenEnvVars}
   * @see NugetRegistryInfoOptionsBase.inferIn.tokenEnvVars
   */
  tokenEnvVars: NRIOptsBase.get('tokenEnvVars').default(() => NugetRegistryInfo.DefaultTokenEnvVars),
  /**
   * A NuGet package registry's API endpoint URL.
   * @default 'https://api.nuget.org/v3/index.json' */
  url: NRIOptsBase.get('url').default(() => defaultNugetSource),
})
const NRIOpts = NugetRegistryInfoOptions
