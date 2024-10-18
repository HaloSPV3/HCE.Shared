import { ok, strictEqual } from 'node:assert/strict'
import { exec } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, type PathLike } from 'node:fs'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join as joinPaths } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { dir, type DirResult, setGracefulCleanup } from 'tmp'
import { getEnvVarValue } from '../envUtils.js'
import type { MSBuildProject } from './MSBuildProject.js'
import { NugetRegistryPair } from './NugetRegistryPair.js'

const execAsync = promisify(exec)
const tmpDirNamespace = joinPaths(tmpdir(), 'HCE.Shared', '.NET', 'Dummies')

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
    ? joinPaths(tmpDirNamespace, project.Properties.PackageId)
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
   * @param {string} [url="https://api.nuget.org/v3/index.json"] A NuGet package
   * registry's API URL. Default: https://api.nuget.org/v3/index.json
   * @param {string} [tokenEnvVars="NUGET_TOKEN"] The environment variables
   * whose values are tokens with permission to push a package to the NuGet
   * package registry. The array is iterated through until one token is found.
   * If none of the environment variables are defined, this constructor will
   * throw an {@link Error}.
   * @param {MSBuildProject} project The project whose package(s) will be
   * pushed. Its `PackageId` will be read. Its `PackageVersion` will be
   * overridden via CLI args to create a dummy package. The real package's
   * `PackageVersion` will *not* be overridden.
   */
  constructor(url = 'https://api.nuget.org/v3/index.json', tokenEnvVars: readonly string[] = NugetRegistryInfo.DefaultTokenEnvVars, project: MSBuildProject) {
    this.url = url
    /* get token value - may throw */
    this.resolvedEnvVariable = NugetRegistryInfo.getTokenValue(tokenEnvVars)
    this._project = project
    // this.canPushPackagesToUrl;
  }

  private readonly _project: MSBuildProject
  public get project(): MSBuildProject { return this._project }

  /**
   * Execute `dotnet pack ${this.project.Properties.MSBuildProjectFullPath} -p:Version=0.0.1-DUMMY -output ${outDir}` to create the dummy package for the current
   * {@link project} and returns the full paths of all nupkg, symbols.nupkg, and snupkg files
   * created by the Pack target.
   */
  public async PackDummyPackage(): Promise<string[]> {
    /** e.g.
     * ```txt
     *  Determining projects to restore...
     *  All projects are up-to-date for restore.
     *  GroupBox.Avalonia -> C:\Repos\BinToss\GroupBox.Avalonia\GroupBox.Avalonia\bin\Release\net6.0\GroupBox.Avalonia.dll
     *  Successfully created package 'C:\Users\Noah\AppData\Local\Temp\HCE.Shared\.NET\Dummies\BinToss.GroupBox.Avalonia\BinToss.GroupBox.Avalonia.1.1.0-alpha.53.nupkg'.
     *  Successfully created package 'C:\Users\Noah\AppData\Local\Temp\HCE.Shared\.NET\Dummies\BinToss.GroupBox.Avalonia\BinToss.GroupBox.Avalonia.1.1.0-alpha.53.snupkg'.
     * ```
     */
    const packOutput = await execAsync(`dotnet pack ${this.project.Properties.MSBuildProjectFullPath} -p:Version=0.0.1-DUMMY -output ${getDummiesDir(this.project)}`)
    return NugetRegistryInfo._parseStdoutForNupkgs(packOutput.stdout)
  }

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
   * successful release will push a package two a source *twice*—once with the
   * dummy version and again with nextVersion.
   */
  private static async pushDummyAsync(url: string, tokenValue: string): Promise<{ stdout: string, stderr: string }> {
    const dummyNupkgPath = await getDummyNupkgAsync()
    const pushResult = await execAsync(`dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key ${tokenValue} --skip-duplicate`,
      { encoding: 'utf8' },
    ).catch((reason) => {
      throw reason instanceof Error && 'stdout' in reason && typeof reason.stdout === 'string'
        ? new Error(`Command failed: dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key *** --skip-duplicate"\n${reason.stdout.replace('\r', '').replace('\n\n\n', '').split('\nUsage: dotnet nuget push [arguments] [options]')[0].trimEnd()}`)
        : reason instanceof Error
          ? reason
          : new Error(String(reason))
    })
    return pushResult
    async function getDummyNupkgAsync(): Promise<string> {
      // find package.json
      const packageJson = import.meta.resolve('../../package.json')
      if (!packageJson)
        throw new ReferenceError('failed to get @halospv3/hce.shared-config\'s package.json and its dirname')
      const dummyPkgPath: string = joinPaths(fileURLToPath(dirname(packageJson)), 'static', 'DUMMY.1.0.0.nupkg')
      // originally implemented by F1LT3R at https://gist.github.com/F1LT3R/2e4347a6609c3d0105afce68cd101561
      const sha256 = (path: PathLike): Promise<string> => new Promise((resolve, reject) => {
        const hash = createHash('sha256')
        const rs = createReadStream(path)
        rs.on('error', reject)
        rs.on('data', chunk => hash.update(chunk))
        rs.on('end', () => resolve(hash.digest('hex').toUpperCase()))
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
            'Multiple errors occurred while locating and verifying DUMMY.1.0.0.nupkg. The stored nupkg\'s hash did not match the stored hash. The nupkg was regenerated, deterministic-ated, and re-hashed, but the hashes still didn\'t match!',
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
        const dummyFilePath = joinPaths(tmpDirResult.name, 'DUMMY')

        try {
          const dummyProjPath: string = joinPaths(tmpDirResult.name, 'DUMMY.csproj')
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
     * @returns `true` if the token can be used to push nupkg to the given Nuget registry
     * @throws
     * - {@link ReferenceError} when NugetRegistryInfo.resolvedVariable is null or undefined
     * - {@link TypeError} when the environment variable {@link NugetRegistryInfo.resolvedEnvVariable} is undefined
     * - {@link Error}
     *   - The token is invalid, of the wrong token type, or lacks permission to push packages
     *   - The URL does not exist or a connection could not be established
     * @type {Promise<true>}
     */
  public get canPushPackagesToUrl(): Promise<true> {
    if (this.#canPushPackagesToUrl !== undefined)
      return this.#canPushPackagesToUrl

    if (!this.resolvedEnvVariable) {
      const errMsg = 'NugetRegistryInfo.resolvedVariable must not be null or undefined!'
      const err = new ReferenceError(errMsg)
      return this.#canPushPackagesToUrl = Promise.reject(err)
    }

    const tokenValue = getEnvVarValue(this.resolvedEnvVariable)
    if (tokenValue === undefined) {
      const errMsg = `The environment variable ${this.resolvedEnvVariable} is undefined!`
      const err = new TypeError(errMsg)
      return this.#canPushPackagesToUrl = Promise.reject(err)
    }

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
   * todo: deprecate and remove
   * if canPushPackagesToUrl, returns a NugetRegistryPair based on `this`.
   * @returns A NugetRegistryPair representing a NuGet source's API endpoint and the token that can be used to push the name of the variable containing the token value and the url to which nupkgs and snupkgs are pushed
   */
  async toRegistryPair(): Promise<NugetRegistryPair> {
    return await this.canPushPackagesToUrl.then(() =>
      new NugetRegistryPair(this.resolvedEnvVariable, this.url),
    )
  }

  /**
   * This method is called by NugetRegistryInfo's constructor, but it
   * should be executed during...\
   * Semantic Release Step: `verifyConditions`
   * @param tokenEnvVars The name of the environment variable(s) whose value is a NuGet API key.
   * @returns The value of the first defined environment variable.
   * @throws {Error} when none of the provided environment variables are defined.
   */
  public static getTokenValue(tokenEnvVars: readonly string[]): string {
    const definedTokens = Object.freeze(
      tokenEnvVars.map(
        // key-value tuple
        v => [v, getEnvVarValue(v)] as const,
      ).filter(
        (pair): pair is [string, string] => pair[1] !== undefined,
      ),
    )

    if (definedTokens.length === 0) {
      throw new Error(
        `\
The environment variables [${tokenEnvVars.join(', ')}] were specified \
as the source of the token to push a NuGet package to GitHub, \
but no tokens were defined.`)
    }

    return definedTokens[0][1]
  }
}

// shorthand/alias for NugetRegistryInfo
const NRI = NugetRegistryInfo
