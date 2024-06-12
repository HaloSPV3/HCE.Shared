import { getEnvVarValue } from '../envUtils.js';
import { NugetRegistryInfo } from './NugetRegistryInfo.js';

// https://docs.gitlab.com/ee/user/packages/nuget_repository/
export class GitlabNugetRegistryInfo extends NugetRegistryInfo {
    /** The GitLab API v4 root URL.  */
    static readonly CI_API_V4_URL = getEnvVarValue('CI_API_V4_URL') ?? 'https://gitlab.com/api/v4/';
    /** If you want to publish to your GitLab server, this needs to be set to the Id of the project you want to publish to. When running in GitLab CI this is already set to the project the pipeline runs in by GitLab. */
    static readonly projectId = getEnvVarValue('CI_PROJECT_ID');
    static readonly ownerId = getEnvVarValue('CI_PROJECT_NAMESPACE_ID');

    // static readonly NUGET_PKG_GITHUB_COM = 'https://nuget.pkg.github.com'

    /**
     * Creates an instance of GitlabNugetRegistryInfo.
     *
     * @constructor
     * @param {string} [url=""] The GitLab Nuget API URL to push packages to. If {@link useGroupLevelEndpoint}, defaults to {@link GitlabNugetRegistryInfo.getNugetGitlabGroupUrl}. Else, {@link GitlabNugetRegistryInfo.getNugetGitlabProjectUrl}.
     * @param {string} [tokenEnvVar="CI_JOB_TOKEN"]
     * @param {string[]} [fallbackEnvVars=[]]
     * @param {boolean} [useGroupLevelEndpoint=false]
     */
    constructor(
        url = "",
        tokenEnvVar = "CI_JOB_TOKEN",
        fallbackEnvVars: string[] = [],
        useGroupLevelEndpoint = false
    ) {
        if (url === "") {
            url = useGroupLevelEndpoint
                ? GitlabNugetRegistryInfo.getNugetGitlabGroupUrl()
                : GitlabNugetRegistryInfo.getNugetGitlabProjectUrl()
            if (!url)
                throw new ReferenceError("GitLab Nuget API url was not provided and neither the CI_PROJECT_ID nor the CI_PROJECT_NAMESPACE_ID (if useGroupLevelEndpoint === true) were defined in the current process's environment variables.")
        }

        if (!fallbackEnvVars.includes('GL_TOKEN'))
            fallbackEnvVars.push('GL_TOKEN');
        if (!fallbackEnvVars.includes('GITLAB_TOKEN'))
            fallbackEnvVars.push('GITLAB_TOKEN');
        super(url, tokenEnvVar, fallbackEnvVars);
    }

    /**
     * Get the GitLab Nuget API for your project url as seen in https://docs.gitlab.com/ee/user/packages/nuget_repository/index.html#publish-a-nuget-package-by-using-cicd
     * ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json
     */
    static getNugetGitlabProjectUrl(): string {
        return this.projectId
            ? `${this.CI_API_V4_URL}/projects/${this.projectId}/packages/nuget/index.json`
            : "";
    }


    /**
     * ${CI_API_V4_URL}/groups/${CI_PROJECT_NAMESPACE_ID}/-/packages/nuget/index.json
     *
     * @static
     * @returns {string}
     */
    static getNugetGitlabGroupUrl(): string {
        return this.ownerId
            ? `${this.CI_API_V4_URL}/groups/${this.ownerId}/-/packages/nuget/index.json`
            : "";
    }
}