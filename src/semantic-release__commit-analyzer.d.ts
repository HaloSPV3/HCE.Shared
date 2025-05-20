declare module '@semantic-release/commit-analyzer' {

  interface RuleObject {
    type?: string;
    scope?: string;
    release: string;
  }

  type AnyRecord = Record<keyof unknown, unknown>;

  export interface CommitAnalyzerConfig {
    preset?: string;
    config?: string;
    parserOpts?: AnyRecord;
    /**
     * Can be a string only if the string is a path to a modules whose default export provides {@link RuleObject}[].
     * See https://github.com/semantic-release/commit-analyzer?tab=readme-ov-file#external-package--file
     */
    releaseRules?: string | RuleObject[];
    presetConfig?: AnyRecord;
  }

  export type Options = CommitAnalyzerConfig;

  /**
   * Determine the type of release to create based on a list of commits.
   * @param pluginConfig The plugin configuration.
   * @param pluginConfig.preset conventional-changelog preset ('angular', 'atom', 'codemirror', 'ember', 'eslint', 'express', 'jquery', 'jscs', 'jshint')
   * @param pluginConfig.config Require-able npm package with a custom conventional-changelog preset
   * @param pluginConfig.releaseRules A `String` to load an external module or an `Array` of rules.
   * @param pluginConfig.parserOpts Additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
   * @param context The semantic-release context.
   * @param context.commits The commits to analyze.
   * @param context.cwd The current working directory.
   * @returns the type of release to create based on the list of commits or `null` if no release has to be done.
   * @see 'file://./../node_modules/@semantic-release/commit-analyzer/index.js'
   */
  export function analyzeCommits(
    pluginConfig: {
      preset: string;
      config: string;
      releaseRules: string | AnyRecord[];
      parserOpts: unknown;
    },
    context: {
      commits: object[];
      cwd: string;
    },
  ): Promise<string | null>;
}
