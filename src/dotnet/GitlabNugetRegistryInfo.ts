import { isNativeError } from 'node:util/types';
import { getEnvVarValue } from '../utils/env.js';
import {
  NugetRegistryInfo,
  NRIOpts,
  NRIOptsBase,
} from './NugetRegistryInfo.js';
import type { Out, Type } from 'arktype';
import type { Default } from 'arktype/internal/attributes.ts';
import type { MSBuildProject, MSBuildEvaluationOutput } from './MSBuildProject.js';
import type { NugetProjectProperties } from './NugetProjectProperties.js';

// https://docs.gitlab.com/ee/user/packages/nuget_repository/
export class GitlabNugetRegistryInfo extends NugetRegistryInfo {
  /**
   * The GitLab API v4 root URL.
   * @returns The value of the environment variable `CI_API_V4_URL`.
   * If that's `undefined`, 'https://gitlab.com/api/v4' is returned, instead.
   */
  static get CI_API_V4_URL(): string {
    return getEnvVarValue('CI_API_V4_URL') ?? 'https://gitlab.com/api/v4';
  }

  /**
   * CI_PROJECT_ID - If you want to publish to your GitLab server, this needs to be set to the Id of the project you want to publish to. When running in GitLab CI this is already set to the project the pipeline runs in by GitLab.
   * This method checks the contents of your `.env` file, if present.
   * @returns The value of the environment variable `CI_PROJECT_ID` or `undefined`.
   * @todo add URI encoded project pathname as alternative e.g. 'halospv3%2FHCE.Shared' in 'https://gitlab.com/api/v4/projects/halospv3%2FHCE.Shared'
   */
  static get projectId(): string | undefined {
    return getEnvVarValue('CI_PROJECT_ID');
  }

  /**
   * CI_PROJECT_NAMESPACE_ID
   * This method checks the contents of your `.env` file, if present.
   * @returns The value of the environment variable 'CI_PROJECT_NAMESPACE_ID' or `undefined`.
   */
  static get ownerId(): string | undefined {
    return getEnvVarValue('CI_PROJECT_NAMESPACE_ID');
  }

  static readonly DefaultGitlabTokenEnvVars: readonly ['GL_TOKEN', 'GITLAB_TOKEN', 'CI_JOB_TOKEN'] = Object.freeze([
    'GL_TOKEN',
    'GITLAB_TOKEN',
    'CI_JOB_TOKEN',
  ] as const);

  /**
   * Creates an instance of GitlabNugetRegistryInfo.
   * @param opts The input type of {@link GLNRIOpts.from}
   */
  constructor(opts: typeof GLNRIOpts.inferIn) {
    const optsOut = GLNRIOpts.from(opts);
    if (isNativeError(optsOut.source))
      throw optsOut.source;
    super(optsOut as typeof optsOut & { source: string });
  }

  /**
   * Get the GitLab Nuget API for your project url as seen in https://docs.gitlab.com/ee/user/packages/nuget_repository/index.html#publish-a-nuget-package-by-using-cicd
   * ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json
   * @returns If {@link this.projectId} is a string, a string formatted like
   * `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json`.
   * Else, {@link Error}.
   */
  static get projectUrl(): string | Error {
    return this.projectId
      ? `${this.CI_API_V4_URL}/projects/${this.projectId}/packages/nuget/index.json`
      : new Error('The project-type URL was specified, but one or more of the required environment variables (CI_API_V4_URL, CI_PROJECT_ID) were undefined.');
  }

  /**
   * ${CI_API_V4_URL}/groups/${CI_PROJECT_NAMESPACE_ID}/-/packages/nuget/index.json
   * @returns If {@link ownerId} is a string, then a string formatted like
   * `${CI_API_V4_URL}/groups/${CI_PROJECT_NAMESPACE_ID}/-/packages/nuget/index.json`.
   * Else, {@link Error}.
   */
  static get groupUrl(): string | Error {
    return this.ownerId
      ? `${this.CI_API_V4_URL}/groups/${this.ownerId}/-/packages/nuget/index.json`
      : new Error('env.CI_PROJECT_NAMESPACE_ID must be defined to use its GitLab API endpoint!');
  }
}
const GLNRI = GitlabNugetRegistryInfo;

/**
 * The Arktype definition for {@link GitlabNugetRegistryInfo}'s constructor parameter. Construct an object of this type by calling {@link GLNRIOpts.from}
 */
export const GLNRIOpts: Type<{
  project: MSBuildProject | {
    readonly Items: Readonly<Required<MSBuildEvaluationOutput>['Items']>;
    readonly Properties: Readonly<NugetProjectProperties>;
    readonly Targets: readonly string[];
    readonly TargetResults: Required<MSBuildEvaluationOutput>['TargetResults'][];
  };
  tokenEnvVars: Default<readonly string[], readonly ['GL_TOKEN', 'GITLAB_TOKEN', 'CI_JOB_TOKEN']>;
  source: (In: Default<string | Error, string | Error>) => Out<string | Error>;
}> = NRIOpts.merge({
  tokenEnvVars: NRIOptsBase.get('tokenEnvVars').default(
    () => GLNRI.DefaultGitlabTokenEnvVars,
  ),
  /**
   * The GitLab Nuget API URL to push packages to -OR- a keyword such as "group"
   * or "project" used to determine URL.
   * @default GLNRI.projectUrl
   * @see {@link GLNRI.projectUrl}, {@link GLNRI.groupUrl}
   */
  // todo: change '"group" | "project"' to '"GITLAB:PROJECT" | "GITLAB:GROUP"'
  source: NRIOptsBase.get('source')
    .or('"group" | "project" | Error')
    .pipe((source: string | Error): string | Error => {
      switch (source) {
        case 'group': {
          return GLNRI.groupUrl;
        }
        case 'project': {
          return GLNRI.projectUrl;
        }
        default: {
          return source;
        }
      }
    }).default(() => GLNRI.projectUrl),
});
