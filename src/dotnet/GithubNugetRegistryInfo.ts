import { getEnvVarValue } from '../utils/env.js';
import {
  NugetRegistryInfo,
  NRIOptsBase,
} from './NugetRegistryInfo.js';

const NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com';
const DefaultGithubTokenEnvVars = Object.freeze([
  'GITHUB_TOKEN',
  'GH_TOKEN',
] as const);

export class GithubNugetRegistryInfo extends NugetRegistryInfo {
  static readonly NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com';
  static readonly DefaultGithubTokenEnvVars = Object.freeze([
    'GITHUB_TOKEN',
    'GH_TOKEN',
  ] as const);

  // GithubNugetRegistryInfo.CtorArgs(...) behaves differently than NugetRegistryInfo.CtorArgs(...)
  /**
   * Creates an instance of GithubNugetRegistryInfo.
   * @param opts The input type of {@link GHNRIOpts.from}
   */
  constructor(opts: (typeof GHNRIOpts)['inferIn']) {
    super(GHNRIOpts.from(opts));
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
    const owner = getEnvVarValue('GITHUB_REPOSITORY_OWNER');
    return owner === undefined
      ? undefined
      : `${NUGET_PKG_GITHUB_COM}/${owner}/index.json`;
  }
}
const GHNRI = GithubNugetRegistryInfo;

/**
 * @remarks
 * The default value of `url` is dependent on {@link GHNRI.getNugetGitHubUrl} and will default to an empty string if the environment variable `GITHUB_REPOSITORY_OWNER` is undefined!
 */
export const GHNRIOpts = NRIOptsBase.merge({
  url: NRIOptsBase.in.get('url')
    .default(() => GHNRI.getNugetGitHubUrl() ?? ''),
  tokenEnvVars: NRIOptsBase.in.get('tokenEnvVars')
    .default(
      /* must be a function. A fixed-length array is NOT a primitive type! */
      () => DefaultGithubTokenEnvVars,
    ),
});
