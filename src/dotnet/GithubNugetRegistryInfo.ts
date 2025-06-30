import { getEnvVarValue } from '../envUtils.js'
import type { MSBuildProject } from './MSBuildProject.js'
import { NugetRegistryInfo } from './NugetRegistryInfo.js'

export class GithubNugetRegistryInfo extends NugetRegistryInfo {
  static readonly NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com'
  static readonly DefaultGithubTokenEnvVars = Object.freeze([
    'GITHUB_TOKEN',
    'GH_TOKEN',
  ] as const)

  constructor(
    url: string = GithubNugetRegistryInfo.getNugetGitHubUrl(),
    tokenEnvVars: readonly string[] = GithubNugetRegistryInfo.DefaultGithubTokenEnvVars,
    dotnetProject: MSBuildProject,
  ) {
    super(url, tokenEnvVars, dotnetProject)
  }

  /**
   * Returns `https://nuget.pkg.github.com/${GITHUB_REPOSITORY_OWNER}/index.json`
   * or (if GITHUB_REPOSITORY_OWNER is not defined in {@link process.env} nor
   * {@link process.cwd() $CWD}/.env) `undefined`.
   *
   * @export
   * @returns {string?} If GITHUB_REPOSITORY_OWNER is defined, returns the GitHub Package Repository URL endpoint for NuGet pushes (--source).\
   * Otherwise, returns `undefined`
   */
  static getNugetGitHubUrl(): string | undefined {
    const owner = GithubNugetRegistryInfo.getOwner()
    if (owner)
      return `${NUGET_PKG_GITHUB_COM}/${owner}/index.json`
    else return owner
  }

  /** returns the value of GITHUB_REPOSITORY_OWNER */
  static getOwner(): string | undefined {
    return getEnvVarValue('GITHUB_REPOSITORY_OWNER')
  }
}
