import type { Type } from 'arktype';
import { getEnvVarValue } from '../utils/env.js';
import type { MSBuildProject, MSBuildEvaluationOutput } from './MSBuildProject.js';
import type { NugetProjectProperties } from './NugetProjectProperties.js';
import {
  NugetRegistryInfo,
  NRIOptsBase,
} from './NugetRegistryInfo.js';
import type { Default } from 'arktype/internal/attributes.ts';

const NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com';
export const DefaultGithubTokenEnvVars: readonly ['GH_TOKEN', 'GITHUB_TOKEN'] = Object.freeze([
  'GH_TOKEN',
  'GITHUB_TOKEN',
]);

export class GithubNugetRegistryInfo extends NugetRegistryInfo {
  static readonly NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com';

  // GithubNugetRegistryInfo.CtorArgs(...) behaves differently than NugetRegistryInfo.CtorArgs(...)
  /**
   * Creates an instance of GithubNugetRegistryInfo.
   * @param opts The input type of {@link GHNRIOpts.from}
   */
  constructor(opts: typeof GHNRIOpts.inferIn) {
    super(GHNRIOpts.from(opts));
  }

  /**
   * Returns `https://nuget.pkg.github.com/${GITHUB_REPOSITORY_OWNER}/index.json`
   * or (if GITHUB_REPOSITORY_OWNER is not defined in {@link process.env} nor
   * {@link process.cwd() $CWD}/.env) `undefined`.
   * @returns If GITHUB_REPOSITORY_OWNER is defined, returns the GitHub Package Repository URL endpoint for NuGet pushes (--source).\
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
 * The default value of {@link GHNRIOpts.t.source `source`} is dependent on
 * {@link GHNRI.getNugetGitHubUrl} and will default to an empty string if the
 * environment variable `GITHUB_REPOSITORY_OWNER` is undefined!
 */
export const GHNRIOpts: Type<{
  project: MSBuildProject | {
    readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
    readonly Properties: Readonly<NugetProjectProperties>;
    readonly Targets: readonly string[];
    readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];
  };
  source: Default<string, string>;
  tokenEnvVars: Default<readonly string[], readonly ['GH_TOKEN', 'GITHUB_TOKEN']>;
}> = NRIOptsBase.merge({
  /** @see {@link GHNRI.getNugetGitHubUrl } */
  source: NRIOptsBase.get('source')
    .default(() => GHNRI.getNugetGitHubUrl() ?? ''),
  tokenEnvVars: NRIOptsBase.get('tokenEnvVars')
    .default(
      /* must be a function. A fixed-length array is NOT a primitive type! */
      (): typeof DefaultGithubTokenEnvVars => DefaultGithubTokenEnvVars,
    ),
});
