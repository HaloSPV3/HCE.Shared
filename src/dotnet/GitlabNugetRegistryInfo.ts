import { getEnvVarValue } from '../envUtils.js'
import {
  NugetRegistryInfo as NugetRegistryInfo,
  NugetRegistryInfoOptions as NRIOpts,
  NugetRegistryInfoOptionsBase as NRIOptsBase,
} from './NugetRegistryInfo.js'

// https://docs.gitlab.com/ee/user/packages/nuget_repository/
export class GitlabNugetRegistryInfo extends NugetRegistryInfo {
  /** The GitLab API v4 root URL.  */
  static get CI_API_V4_URL() { return getEnvVarValue('CI_API_V4_URL') ?? 'https://gitlab.com/api/v4' };
  /** CI_PROJECT_ID - If you want to publish to your GitLab server, this needs to be set to the Id of the project you want to publish to. When running in GitLab CI this is already set to the project the pipeline runs in by GitLab. */
  static get projectId() { return getEnvVarValue('CI_PROJECT_ID') };

  /** CI_PROJECT_NAMESPACE_ID */
  static get ownerId() { return getEnvVarValue('CI_PROJECT_NAMESPACE_ID') };

  static readonly DefaultGitlabTokenEnvVars = Object.freeze(['CI_JOB_TOKEN', 'GITLAB_TOKEN', 'GL_TOKEN'] as const)

  /**
   * Creates an instance of GitlabNugetRegistryInfo.
   * @constructor
   * @param opts The input type of {@link GLNRIOpts.from}
   */
  constructor(opts: typeof GLNRIOpts['inferIn']) {
    super(GLNRIOpts.from(opts))
  }

  /**
   * Get the GitLab Nuget API for your project url as seen in https://docs.gitlab.com/ee/user/packages/nuget_repository/index.html#publish-a-nuget-package-by-using-cicd
   * ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json
   */
  static get projectUrl(): string | undefined {
    return this.projectId
      ? `${this.CI_API_V4_URL}/projects/${this.projectId}/packages/nuget/index.json`
      : undefined
  }

  /**
   * ${CI_API_V4_URL}/groups/${CI_PROJECT_NAMESPACE_ID}/-/packages/nuget/index.json
   *
   * @static
   * @returns {string}
   */
  static get groupUrl(): string | undefined {
    return this.ownerId
      ? `${this.CI_API_V4_URL}/groups/${this.ownerId}/-/packages/nuget/index.json`
      : undefined
  }
}
const GLNRI = GitlabNugetRegistryInfo

/**
 * The Arktype definition for {@link GitlabNugetRegistryInfo}'s constructor parameter. Construct an object of this type by calling {@link GLNRIOpts.from}
 * @static @override @readonly
 * @param {typeof GLNRIOpts.inferIn} data
 * @param {typeof NRIOptsBase.t.project} data.project See {@link NRIOptsBase.t.project}
 * @param {typeof GLNRIOpts.inferIn.tokenEnvVars} [data.tokenEnvVars=DefaultGitlabTokenEnvVars] Defaults to {@link DefaultGitlabTokenEnvVars}. See {@link NRIOpts.t.tokenEnvVars}
 * @param {typeof GLNRIOpts.inferIn.url} data.url The GitLab Nuget API URL to push packages to -OR- a keyword such as "group" or "project" used to determine URL. See {@link GLNRI.projectUrl}, {@link GLNRI.groupUrl}
 */
export const GitlabNugetRegistryInfoOptions = NRIOpts.merge({
  tokenEnvVars: NRIOptsBase.get('tokenEnvVars').default(() => GLNRI.DefaultGitlabTokenEnvVars),
  url: NRIOptsBase.get('url').or('"group" | "project"').default('project'),
}).pipe((obj) => {
  switch (obj.url) {
    case 'group':
      if (GLNRI.groupUrl === undefined)
        throw new Error('The group-type URL was specified, but one or more of the required environment variables (CI_API_V4_URL, CI_PROJECT_NAMESPACE_ID) were undefined.')
      obj.url = GLNRI.groupUrl
      break
    /* fall to default */
    case 'project':
      if (GLNRI.projectUrl === undefined)
        throw new Error('The project-type URL was specified, but one or more of the required environment variables (CI_API_V4_URL, CI_PROJECT_ID) were undefined.')
      obj.url = GLNRI.projectUrl
      break
    default:
      break
  }
  return obj
})

const GLNRIOpts = GitlabNugetRegistryInfoOptions
