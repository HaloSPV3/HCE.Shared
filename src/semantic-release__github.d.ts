declare module '@semantic-release/github' {
  /**
   * @see https://github.com/semantic-release/github#configuration
   */
  export interface Env extends NodeJS.ProcessEnv {
    /**
     * __Required__. The token used to authenticate with GitHub.
     */
    GITHUB_TOKEN?: string;
    /**
     * {@inheritDoc GitHubEnv.GITHUB_TOKEN}
     */
    GH_TOKEN?: string;

    /**
     *  The GitHub server endpoint.
     */
    GITHUB_URL?: string;
    /**
     * {@inheritDoc GitHubEnv.GITHUB_URL}
     */
    GH_URL?: string;

    /**
     * The GitHub API prefix, relative to {@link Env.GITHUB_URL GITHUB_URL}.
     */
    GITHUB_PREFIX?: string;
    /** {@inheritDoc GitHubEnv.GITHUB_PREFIX} */
    GH_PREFIX?: string;

    /**
     * The GitHub API endpoint. Note that this overwrites {@link Env.GITHUB_PREFIX GITHUB_PREFIX}.
     */
    GITHUB_API_URL?: string;
  }

  /** https://github.com/isaacs/node-glob#glob-primer */
  type Glob = string;

  /** @see https://github.com/semantic-release/github#assets */
  interface Asset {
    /** __Required__. A {@link https://github.com/isaacs/node-glob#glob-primer glob} to identify the files to upload. */
    path: Glob;
    /**
     * The name of the downloadable file on the GitHub release.
     * @defaultValue File name extracted from the {@link Asset.path path}.
     */
    name?: string;
    /** Short description of the file displayed on the GitHub release. */
    label?: string;
  }

  /** @see https://github.com/semantic-release/github#configuration */
  export interface Options {
    /**
     * The GitHub server endpoint.
     * @defaultValue {@link Env.GH_URL GH_URL} or  {@link Env.GITHUB_URL GITHUB_URL} environment variables.
     */
    githubUrl?: string;
    /**
     * The GitHub API prefix, relative to `githubUrl`.
     * @defaultValue {@link Env.GH_PREFIX GH_PREFIX} or {@link Env.GITHUB_PREFIX GITHUB_PREFIX} environment variables
     */
    githubApiPathPrefix?: string;
    /**
     * The GitHub API endpoint.
     * Note that this overwrites {@link Options.githubApiPathPrefix githubApiPathPrefix}.
     */
    githubApiUrl?: string;
    /**
     * The proxy to use to access the GitHub API.
     * Set to `false` to disable usage of proxy.
     * See {@link https://github.com/semantic-release/github#proxy proxy}.
     */
    proxy?: string | false;
    /**
     * An array of files to upload to the release.
     * See {@link https://github.com/semantic-release/github#assets assets}.
     */
    assets?: Glob | (Asset | Glob)[];
    /**
     * The comment to add to each issue and pull request resolved by the release.
     * Set to `false` to disable commenting on issues and pull requests.
     * See {@link https://github.com/semantic-release/github?tab=readme-ov-file#successcomment successComment}.
     * @defaultValue `:tada: This issue has been resolved in version ${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](<github_release_url>)`
     */
    successComment?: string | false;
    /**
     * The content of the issue created when a release fails.
     * Set to `false` to disable opening an issue when a release fails.
     * See {@link https://github.com/semantic-release/github?tab=readme-ov-file#failcomment failComment}.
     * @defaultValue Friendly message with links to semantic-release documentation and support, with the list of errors that caused the release to fail.
     */
    failComment?: string | false;
    /**
     * The title of the issue created when a release fails.
     * Set to `false` to disable opening an issue when a release fails.
     * @defaultValue `The automated release is failing 🚨`
     */
    failTitle?: string | false;
    /**
     * The {@link https://help.github.com/articles/about-labels labels} to add to the issue created when a release fails.
     * Set to `false` to not add any label.
     * @default ['semantic-release']
     */
    labels?: string[] | false;
    /**
     * The {@link https://help.github.com/articles/assigning-issues-and-pull-requests-to-other-github-users assignees} to add to the issue created when a release fails.
     */
    assignees?: unknown;
    /**
     *  The {@link https://help.github.com/articles/about-labels labels} to add to each issue and pull request resolved by the release.
     * Set to `false` to not add any label.
     * See {@link https://github.com/semantic-release/github#releasedlabels releasedLabels}.
     * @default [ 'released<%= nextRelease.channel ? \` on @\${nextRelease.channel}\` : "" %>' ]
     */
    releasedLabels?: string[];
    /**
     * Will add release links to the GitHub Release. Can be `false`, `"bottom"` or `"top"`. See {@link https://github.com/semantic-release/github#addReleases addReleases}.
     * @default false
     */
    addReleases?: false | 'bottom' | 'top';
    /**
     * A boolean indicating if a GitHub Draft Release should be created instead of publishing an actual GitHub Release.
     * @default false
     */
    draftRelease?: boolean;
    /**
     * A {@link https://lodash.com/docs#template Lodash template} to customize the github release's name
     * @default '<%= nextRelease.name %>'
     */
    releaseNameTemplate?: string;
    /**
     * A {@link https://lodash.com/docs#template Lodash template} to customize the github release's body
     * @default '<%= nextRelease.notes %>'
     */
    releaseBodyTemplate?: string;
    /**
     * The category name in which to create a linked discussion to the release.
     * Set to `false` to disable creating discussion for a release.
     * @default false
     */
    discussionCategoryName?: string | false;
  }
}
