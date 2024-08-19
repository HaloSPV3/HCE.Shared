// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ok } from 'node:assert'
import { getEnvVarValue } from '../envUtils.js'
import { NugetRegistryInfo } from './NugetRegistryInfo.js'

/**
 * A simple record-like class with optional 'user' property for user-password authentication.
 * Input of {@link configureDotnetNugetPush} and output of {@link NugetRegistryInfo.prototype.toRegistryPair}.
 */
export class NugetRegistryPair {
  public constructor(tokenEnvVar: string, url: string, user?: string) {
    this.tokenEnvVar = tokenEnvVar
    this.url = url
    this.user = user
  }

  public readonly tokenEnvVar: string
  public readonly url: string
  public readonly user?: string | undefined

  /**
   * convert this class to a `dotnet nuget push command`
   * @param packageOutputPath
   * @returns command
   */
  public toCommand(packageOutputPath: string): string {
    const tokenValue = getEnvVarValue(this.tokenEnvVar)
    ok(getEnvVarValue('SKIP_TOKEN') === 'true' || tokenValue, `The environment variable ${this.tokenEnvVar} is undefined!`)
    return `dotnet nuget push ${packageOutputPath} --source ${this.url} --token ${tokenValue ?? '**placeholder**'}`
  }

  /** alias for {@link NugetRegistryInfo.toRegistryPair} */
  static async fromNugetRegistryInfoAsync(o: NugetRegistryInfo) {
    ok(o instanceof NugetRegistryInfo)
    return await o.toRegistryPair()
  }
}
export const nugetDefault = new NugetRegistryPair('NUGET_TOKEN', 'https://api.nuget.org/v3/index.json')
