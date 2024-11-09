import { type } from 'arktype'
import { ok, strictEqual } from 'node:assert/strict'
import { exec } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, type PathLike } from 'node:fs'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { cwd } from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { dir, type DirResult, setGracefulCleanup } from 'tmp'
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
  #canPushPackagesToUrl: Promise<true> | undefined = undefined

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
   * @param {ReturnType<typeof NRIOpts>} opts The return value of {@link NugetRegistryInfoOptions}
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
  constructor(opts: ReturnType<typeof NRIOpts>) {
    opts = NRIOpts.assert(opts)
    this.url = opts.url
    /**
     * May throw! Assign key of the first key-value pair to
     * {@link resolvedEnvVariable}
     */
    this.resolvedEnvVariable = _GetTokenEnvVariables(opts.tokenEnvVars)[0]?.[0]
    this._project = opts.project

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
   * Execute `dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key
   * ${tokenValue} --skip-duplicate`
   * @param url The URL of the NuGet Source's API endpoint.
   * @param tokenValue The value of the api key retrieved from the Environment
   * variables.
   * @returns The STDOUT and STDERR of the command.
   * @remark This should run at the beginning of Semantic Release's `prepare`
   * step.
   * @deprecated Pushing a generic DUMMY package will not work with NuGet.org.
   * To improve upon this, we need the actual package ID **and**  the actual
   * package with its version set to 0.0.1-DUMMY. This will allow the NuGet
   * Source to perform the authorization check on the actual package ID and
   * verify the actual package is in good shape. HOWEVER, this also means a
   * successful release will push a package to a source *twice*—once with the
   * dummy version and again with nextVersion.
   */
  private static async pushDummyAsync(url: string, tokenValue: string): Promise<{ stdout: string, stderr: string }> {
    const dummyNupkgPath = await getDummyNupkgAsync()
    const pushResult = await execAsync(`dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key ${tokenValue} --skip-duplicate`,
      { encoding: 'utf8' },
    ).catch((reason: unknown) => {
      throw reason instanceof Error && 'stdout' in reason && typeof reason.stdout === 'string'
        ? new Error(`Command failed: dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key *** --skip-duplicate"\n${reason.stdout.replace('\r', '').replace('\n\n\n', '').split('\nUsage: dotnet nuget push [arguments] [options]')[0].trimEnd()}`)
        : reason instanceof Error
          ? reason
          : new Error(String(reason))
    })
    return pushResult

    // todo: rewrite. We no longer use static nupkgs.
    /** returns the full path of the dummy package */
    async function getDummyNupkgAsync(): Promise<string> {
      // find package.json
      const packageJson = import.meta.resolve('../../package.json')
      if (!packageJson)
        throw new ReferenceError('failed to get @halospv3/hce.shared-config\'s package.json and its dirname')
      const dummyPkgPath: string = resolve(fileURLToPath(dirname(packageJson)), 'static', 'DUMMY.1.0.0.nupkg')
      // originally implemented by F1LT3R at https://gist.github.com/F1LT3R/2e4347a6609c3d0105afce68cd101561
      const sha256 = (path: PathLike): Promise<string> => new Promise((promise_resolve, promise_reject) => {
        const hash = createHash('sha256')
        const rs = createReadStream(path)
        rs.on('error', promise_reject)
        rs.on('data', chunk => hash.update(chunk))
        rs.on('end', () => {
          promise_resolve(hash.digest('hex').toUpperCase());
        })
      })

      const expected = '65A383F09CFBE6928619C620057A17D01C5A37704C5FEF1C99C53BB6E1BB6BA2'

      try {
        strictEqual(
          await sha256(dummyPkgPath),
          expected,
        )
      }
      catch (err) {
        setGracefulCleanup()
        await newDummy().then(async () =>
          await makeNupkgDeterministic(dummyPkgPath),
        ).then(async () =>
          strictEqual(
            await sha256(dummyPkgPath),
            expected,
            'The SHA256 of @halospv3/hce.shared-config/static/DUMMY.1.0.0.nupkg did not match! Somebody poisoned the dummy!',
          ),
        ).catch((reason) => {
          throw new AggregateError(
            [
              err instanceof Error ? err : new Error(String(err)),
              reason instanceof Error ? reason : new Error(String(reason)),
            ],
            'Multiple errors occurred while locating and verifying DUMMY.1.0.0.nupkg. The stored nupkg\'s hash did not match the stored hash. The nupkg was regenerated, determinized, and re-hashed, but the hashes still didn\'t match!',
          )
        })
      }

      return dummyPkgPath

      async function newDummy() {
        const tmpDirResult = await new Promise<DirResult>((resolve, reject) => {
          dir({ unsafeCleanup: true }, (err, name, removeCallback) => {
            if (err)
              reject(err)
            resolve({ name, removeCallback } as DirResult)
          })
        })
        const dummyFilePath = resolve(tmpDirResult.name, 'DUMMY')

        try {
          const dummyProjPath: string = resolve(tmpDirResult.name, 'DUMMY.csproj')
          const promiseNewProj = execAsync(`dotnet new classlib--framework net8.0 --output ${tmpDirResult.name}`)
          const csprojContent: string = await promiseNewProj.then(async () =>
            await readFile(dummyProjPath, { encoding: 'utf8' }),
          )
          const newline = csprojContent.includes('`r`n') ? '`r`n' : '`n'

          // create empty Content file so we can pack without libs or deps
          const promiseDummyFile = writeFile(dummyFilePath, '', { encoding: 'utf8' })
          const dummyFileSize = (await promiseDummyFile.then(async () =>
            await stat(dummyFilePath),
          )).size

          if (0 !== dummyFileSize) {
            throw 'DUMMY file is not empty'
          }

          // include it in the project
          const modifiedContent = csprojContent.replace(
            '</PropertyGroup>' + newline,
            '</PropertyGroup>' + newline
            + newline
            + '  <ItemGroup>' + newline
            + '    <Content Include="DUMMY"/>' + newline
            + '  </ItemGroup>' + newline,
          )
          const promiseCsprojWrite = writeFile(dummyProjPath, modifiedContent)

          // Note: in .NET SDK 8 and later, `pack` sets Configuration to Release by default. Previous SDKs default to 'Debug'.This is partly due to the inclusion of SourceLink in .NET 8 and later.
          const packResult = await promiseCsprojWrite.then(async () =>
            await execAsync(
              `dotnet pack ${dummyProjPath} `
              + '-o ./ '
              + '--no-build '
              + '--property:Description=DUMMY '
              + '--property:SuppressDependenciesWhenPacking=true '
              + '--property:IncludeBuildOutput=false',
            ),
          )

          if (packResult && existsSync(dummyPkgPath))
            return dummyPkgPath
          throw new Error(`DUMMY.1.0.0.nupkg was successfully recreated, but could not be found at the desired location "${dummyPkgPath}"`)
        }
        finally {
          tmpDirResult.removeCallback()
        }
      }

      async function makeNupkgDeterministic(nupkgPath: string) {
        const packageId = 'Kuinox.NupkgDeterministicator'.toLowerCase()
        const cmd = 'NupkgDeterministicator'
        const deterministicResult = await getDotnetTool(packageId, cmd, true).then(async () =>
          await execAsync(`${cmd} ${nupkgPath}`),
        )

        ok(deterministicResult)
        return

        /**
         * check locally (./.config/dotnet-tools.json) or globally for the given dotnet tool and its command. If not found, try installing it globally.
         * @param packageId
         * @param cmd
         * @returns
         */
        async function getDotnetTool(packageId: string, cmd: string, installIfMissing = false): Promise<void> {
          const errors: Error[] = []
          let found = false

          try {
            const list = await execAsync(`dotnet tool list -g ${packageId}`)
            found = list.stdout.includes(packageId) && list.stdout.includes(cmd)
          }
          catch (err) {
            errors.push(err instanceof Error ? err : new Error(String(err)))
          }

          if (!found) {
            try {
              // try again, but drop 'global' switch; search nearest tool file
              const list = await execAsync(`dotnet tool list ${packageId}`)
              found = list.stdout.includes(packageId) && list.stdout.includes(cmd)
            }
            catch (err) {
              errors.push(err instanceof Error ? err : new Error(String(err)))
            }
          }

          if (!found && installIfMissing) {
            try {
              const promiseInstall = execAsync(`dotnet tool install -g ${packageId}`)
              const list = await promiseInstall.then(async () =>
                await execAsync(`dotnet tool list -g ${packageId}`),
              )
              found = list.stdout.includes(packageId) && list.stdout.includes(cmd)
            }
            catch (err) {
              errors.push(err instanceof Error ? err : new Error(String(err)))
            }

            if (!found)
              throw new AggregateError(errors)

            return
          }
        }
      }
    }
  }

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
   */
  public get canPushPackagesToUrl(): Promise<true> {
    if (this.#canPushPackagesToUrl !== undefined)
      return this.#canPushPackagesToUrl

    const tokenValue = NRI._GetTokenValue(this.resolvedEnvVariable)

    if (tokenValue.startsWith('github_pat_')) {
      const errMsg = `The value of the token in ${this.resolvedEnvVariable} begins with 'github_pat_', indicating it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`
      const err = new Error(errMsg)
      return this.#canPushPackagesToUrl = Promise.reject(err)
    }

    const finalResult = NugetRegistryInfo.pushDummyAsync(this.url, tokenValue)
      .then(async (execAsyncReturn) => {
        ok(execAsyncReturn)
        return true as const
      })

    return this.#canPushPackagesToUrl = finalResult
  }

  /**
   * The first environment variable found to have a defined value.
   *
   * @readonly
   * @type {string}
   */
  readonly resolvedEnvVariable: string
  readonly url: string

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
  // @ts-expect-error Todo: add tests and/or publicize to dismiss this "unused" error.
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
    const packCmd = this.GetPackCommand(opts, true)
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
  // @ts-expect-error Todo: add tests and/or publicize to dismiss this "unused" error.
  private async _PushDummyPackages(opts: typeof NRI.PushPackagesOptionsType.t): Promise<void> {
    const pushCmd: string = this.GetPushDummyCommand(opts)
    /* const output = */ await execAsync(pushCmd)
  }

  // #endregion Push
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
