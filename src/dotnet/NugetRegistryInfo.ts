import { ok, strictEqual } from 'node:assert/strict';
import { exec } from "node:child_process";
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, type PathLike } from 'node:fs';
import { readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from 'node:path';
import { promisify } from "node:util";
import { dir, type DirResult } from "tmp";
import { getEnvVarValue } from "../envUtils.js";
import type { NuGetRegistryPair } from "./dotnetHelpers.js";

const execAsync = promisify(exec);

export class NugetRegistryInfo {
    #canPushPackagesToUrl: Promise<true> | undefined = undefined;

    /**
     * Creates an instance of NugetRegistryInfo.
     * @constructor
     * @param {string} [url="https://api.nuget.org/v3/index.json"] A NuGet package registry's API URL. Default: "https://api.nuget.org/v3/index.json"
     * @param {string} [tokenEnvVar="NUGET_TOKEN"] The environment variable whose value is a token with permission to push a package to the NuGet package registry. Default: "NUGET_TOKEN"
     * @param {string} url - a custom, GitHub-like NuGet registry URL, or the return value of {@link getNugetGitHubUrl}
     * @param {string} [tokenEnvVar="NUGET_TOKEN"] The name of the environment variable storing the API token to use to push packages.
     * @param {string[]} [fallbackEnvVars=[]] Additional environment variables to check if {@link tokenEnvVar} is not found by {@link getEnvVarValue}
     */
    constructor(url = 'https://api.nuget.org/v3/index.json', tokenEnvVar = "NUGET_TOKEN", fallbackEnvVars: string[] = []) {
        this.url = url;
        /* get token value - may throw */
        this.resolvedEnvVariable = NugetRegistryInfo.isTokenDefined(tokenEnvVar, fallbackEnvVars);
        this.canPushPackagesToUrl;
    }

    private static async pushDummyAsync(url: string, tokenValue: string) {
        const dummyNupkgPath = await getDummyNupkgAsync();
        const pushResult = await execAsync(
            `dotnet nuget push ${dummyNupkgPath} --source ${url} --api-key ${tokenValue} --skip-duplicate`,
            { encoding: 'utf8' }
        );
        return pushResult;

        async function getDummyNupkgAsync(): Promise<string> {
            // find package.json
            const packageJson = import.meta.resolve('../../package.json');
            if (!packageJson)
                throw new ReferenceError("failed to get @halospv3/hce.shared-config's package.json and its dirname");
            const dummyPkgPath: string = join(dirname(packageJson), 'static', 'DUMMY.1.0.0.nupkg');
            // stolen from https://gist.github.com/F1LT3R/2e4347a6609c3d0105afce68cd101561
            const sha256 = (path: PathLike): Promise<string> => new Promise((resolve, reject) => {
                const hash = createHash('sha256');
                const rs = createReadStream(path);
                rs.on('error', reject);
                rs.on('data', chunk => hash.update(chunk));
                rs.on('end', () => resolve(hash.digest('hex').toUpperCase()));
            })

            const expected = "65A383F09CFBE6928619C620057A17D01C5A37704C5FEF1C99C53BB6E1BB6BA2";

            try {
                strictEqual(
                    await sha256(dummyPkgPath),
                    expected
                )
            }
            catch (err) {
                await newDummy().then(async () =>
                    await makeNupkgDeterministic(dummyPkgPath)
                ).then(async () =>
                    strictEqual(
                        await sha256(dummyPkgPath),
                        expected,
                        "The SHA256 of @halospv3/hce.shared-config/static/DUMMY.1.0.0.nupkg did not match! Somebody poisoned the dummy!"
                    )
                ).catch(reason => {
                    throw new AggregateError(
                        [
                            err instanceof Error ? err : new Error(String(err)),
                            reason instanceof Error ? reason : new Error(String(reason))
                        ],
                        "Multiple errors occurred while locating and verifying DUMMY.1.0.0.nupkg. The stored nupkg's hash did not match the stored hash. The nupkg was regenerated, deterministic-ated, and re-hashed, but the hashes still didn't match!"
                    );
                });
            }

            return dummyPkgPath;

            async function newDummy() {
                const tmpDirResult = await new Promise<DirResult>((resolve, reject) => {
                    dir({ unsafeCleanup: true }, (err, name, removeCallback) => {
                        if (err)
                            reject(err);
                        resolve({ name, removeCallback } as DirResult);
                    })
                })
                const dummyFilePath = join(tmpDirResult.name, 'DUMMY');

                try {
                    const dummyProjPath: string = join(tmpDirResult.name, 'DUMMY.csproj');
                    const promiseNewProj = execAsync(`dotnet new classlib --framework net8.0 --output ${tmpDirResult.name}`);
                    const csprojContent: string = await promiseNewProj.then(async () =>
                        await readFile(dummyProjPath, { encoding: 'utf8' })
                    );
                    const newline = csprojContent.includes("`r`n") ? "`r`n" : "`n"

                    // create empty Content file so we can pack without libs or deps
                    const promiseDummyFile = writeFile(dummyFilePath, '', { encoding: "utf8" });
                    const dummyFileSize = (await promiseDummyFile.then(async () =>
                        await stat(dummyFilePath)
                    )).size;

                    if (0 !== dummyFileSize) {
                        throw "DUMMY file is not empty"
                    }

                    // include it in the project
                    const modifiedContent = csprojContent.replace(
                        '</PropertyGroup>' + newline,
                        '</PropertyGroup>' + newline +
                        newline +
                        '  <ItemGroup>' + newline +
                        '    <Content Include="DUMMY"/>' + newline +
                        '  </ItemGroup>' + newline
                    );
                    const promiseCsprojWrite = writeFile(dummyProjPath, modifiedContent)

                    // Note: in .NET SDK 8 and later, `pack` sets Configuration to Release by default. Previous SDKs default to 'Debug'.This is partly due to the inclusion of SourceLink in .NET 8 and later.
                    const packResult = await promiseCsprojWrite.then(async () =>
                        await execAsync(
                            `dotnet pack ${dummyProjPath} ` +
                            "-o ./ " +
                            "--no-build " +
                            "--property:Description=DUMMY " +
                            "--property:SuppressDependenciesWhenPacking=true " +
                            "--property:IncludeBuildOutput=false"
                        )
                    );

                    if (packResult && existsSync(dummyPkgPath))
                        return dummyPkgPath;
                    throw new Error(`DUMMY.1.0.0.nupkg was successfully recreated, but could not be found at the desired location "${dummyPkgPath}"`);
                }
                finally {
                    tmpDirResult.removeCallback();
                }
            }

            async function makeNupkgDeterministic(nupkgPath: string) {
                const packageId = 'Kuinox.NupkgDeterministicator'.toLowerCase();
                const cmd = 'NupkgDeterministicator';
                const deterministicResult = await getDotnetTool(packageId, cmd, true).then(async () =>
                    await execAsync(`${cmd} ${nupkgPath}`)
                );

                ok(deterministicResult)
                return;

                /**
                 * check locally (./.config/dotnet-tools.json) or globally for the given dotnet tool and its command. If not found, try installing it globally.
                 * @param packageId
                 * @param cmd
                 * @returns
                 */
                async function getDotnetTool(packageId: string, cmd: string, installIfMissing = false): Promise<void> {
                    const errors: Error[] = [];
                    let found = false;

                    try {
                        const list = await execAsync(`dotnet tool list -g ${packageId}`);
                        found = list.stdout.includes(packageId)
                            && list.stdout.includes(cmd);
                    }
                    catch (err) {
                        errors.push(err instanceof Error ? err : new Error(String(err)));
                    }


                    if (!found) {
                        try {
                            // try again, but drop 'global' switch; search nearest tool file
                            const list = await execAsync(`dotnet tool list ${packageId}`);
                            found = list.stdout.includes(packageId)
                                && list.stdout.includes(cmd);

                        }
                        catch (err) {
                            errors.push(err instanceof Error ? err : new Error(String(err)))
                        }
                    }

                    if (!found && installIfMissing) {
                        try {
                            const promiseInstall = execAsync(`dotnet tool install -g ${packageId}`);
                            const list = await promiseInstall.then(async () =>
                                await execAsync(`dotnet tool list -g ${packageId}`)
                            );
                            found = list.stdout.includes(packageId)
                                && list.stdout.includes(cmd);
                        } catch (err) {
                            errors.push(err instanceof Error ? err : new Error(String(err)));
                        }


                        if (!found)
                            throw new AggregateError(errors);

                        return;
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
            return this.#canPushPackagesToUrl;

        if (!this.resolvedEnvVariable) {
            const errMsg = 'NugetRegistryInfo.resolvedVariable must not be null or undefined!';
            const err = new ReferenceError(errMsg)
            return this.#canPushPackagesToUrl = Promise.reject(err);
        }

        const tokenValue = getEnvVarValue(this.resolvedEnvVariable);
        if (tokenValue === undefined) {
            const errMsg = `The environment variable ${this.resolvedEnvVariable} is undefined!`;
            const err = new TypeError(errMsg);
            return this.#canPushPackagesToUrl = Promise.reject(err);
        }

        if (tokenValue.startsWith('github_pat_')) {
            const errMsg = `The value of the token in ${this.resolvedEnvVariable} begins with 'github_pat_', indicating it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`;
            const err = new Error(errMsg);
            return this.#canPushPackagesToUrl = Promise.reject(err);
        }

        const finalResult = NugetRegistryInfo.pushDummyAsync(this.url, tokenValue)
            .then(async (execAsyncReturn) => {
                ok(execAsyncReturn)
                return true as const;
            });

        return this.#canPushPackagesToUrl = finalResult;
    }

    readonly resolvedEnvVariable: string;
    readonly url: string;

    /**
     * 
     * @returns the name of the variable containing the token value and the url to which nupkgs and snupkgs are pushed
     */
    async toRegistryPair(): Promise<NuGetRegistryPair> {
        ok(await this.canPushPackagesToUrl)
        return {
            tokenEnvVar: this.resolvedEnvVariable,
            url: this.url
        }
    }

    /**
     * 
     * @param tokenEnvVar The name of the environment variable whose value is a NuGet API key. Defaults to 'NUGET_TOKEN'.
     * @param fallbacks Additional env vars to check if `tokenEnvVar` is not present.
     * @returns 
     */
    protected static isTokenDefined(tokenEnvVar = 'NUGET_TOKEN', fallbacks: string[] = []): string {
        let token = getEnvVarValue(tokenEnvVar);
        let errMsg = `The environment variable ${tokenEnvVar} was specified `
            + `as the source of the token to push a NuGet package to GitHub, `
            + `but the environment variable does not exist.`;

        // note: we also check for 'undefined' in case someone mistakenly tried deleting the property by assigning undefined.
        if (token !== undefined && token !== 'undefined')
            return tokenEnvVar;

        if (fallbacks.length > 0) {
            for (const envVar of fallbacks) {
                token = getEnvVarValue(envVar);
                if (token !== undefined && token !== 'undefined')
                    return envVar;
            }

            errMsg = errMsg + ` The following fallback variable(s) were also undefined: ${fallbacks.join()}`;
        }

        throw new Error(errMsg);
    }
}