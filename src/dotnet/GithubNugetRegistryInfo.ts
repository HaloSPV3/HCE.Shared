import { getEnvVarValue } from '../envUtils.js'
import { NugetRegistryInfo } from './NugetRegistryInfo.js'

export class GithubNugetRegistryInfo extends NugetRegistryInfo {
  static readonly NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com'
  constructor(url: string = GithubNugetRegistryInfo.getNugetGitHubUrl(), tokenEnvVar = 'GITHUB_TOKEN', fallbackEnvVars: string[] = []) {
    if (!fallbackEnvVars.includes('GH_TOKEN'))
      fallbackEnvVars.push('GH_TOKEN')
    if (!fallbackEnvVars.includes('NUGET_TOKEN'))
      fallbackEnvVars.push('NUGET_TOKEN')
    super(url, tokenEnvVar, fallbackEnvVars)
  }

  /**
     * Returns `https://nuget.pkg.github.com/${GITHUB_REPOSITORY_OWNER}/index.json` or throws if GITHUB_REPOSITORY_OWNER is not defined in {@link process.env} and {@link process.cwd() $CWD}/.env
     *
     * @export
     * @throws {@link ReferenceError }
     * Explain why this error is thrown.
     *
     * @returns {string} If GITHUB_REPOSITORY_OWNER is defined, returns the GitHub Package Repository URL endpoint for NuGet pushes (--source).
     */
  static getNugetGitHubUrl(): string {
    const owner = GithubNugetRegistryInfo.getOwner()
    if (owner)
      return `${GithubNugetRegistryInfo.NUGET_PKG_GITHUB_COM}/${owner}/index.json`
    throw new ReferenceError('GITHUB_REPOSITORY_OWNER is undefined! Default NuGet source for GitHub is unavailable.')
  }

  /** returns the value of GITHUB_REPOSITORY_OWNER */
  static getOwner(): string | undefined {
    return getEnvVarValue('GITHUB_REPOSITORY_OWNER')
  }
}
