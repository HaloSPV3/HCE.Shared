declare module '@semantic-release/commit-analyzer' {

  // #region RuleObject
  namespace RuleObjects {
    interface _Base {
    /** @default true if {@link release} is 'major' */
      breaking?: boolean;
      revert?: boolean;
      /** @default 'patch' if {@link revert} is `true` */
      release: 'major' | 'premajor' | 'minor' | 'preminor' | 'patch' | 'prepatch' | 'prerelease' | false;
    }

    /**
     * @see {@linkplain https://github.com/conventional-changelog/conventional-changelog/blob/61573ecba6aea718b96365c96993d4fa7d53c6fd/packages/conventional-changelog-angular/src/parser.js#L3-L11 ParserOpts_Angular},
     */
    interface Angular extends _Base {
      type?: 'build' | 'ci' | 'docs' | 'feat' | 'fix' | 'perf' | 'refactor' | 'style' | 'test';
      scope?: string;
      subject?: string;
    }

    /**
     * @see {@linkplain https://github.com/conventional-changelog/conventional-changelog/blob/61573ecba6aea718b96365c96993d4fa7d53c6fd/packages/conventional-changelog-atom/src/parser.js#L3-L4 ParserOpts_Atom}
     * @example The defaults config includes...
     *  [
     *    ...
     *    { emoji: ":racehorse:", release: "patch" },
     *    { emoji: ":bug:", release: "patch" },
     *    { emoji: ":penguin:", release: "patch" },
     *    { emoji: ":apple:", release: "patch" },
     *    { emoji: ":checkered_flag:", release: "patch" }
     *    ...
     *  ]
     */
    interface Atom extends _Base {
    /**
     * Consider starting the commit message with an applicable emoji:
     *  - 🎨 :art: when improving the format/structure of the code
     *  - 🐎 :racehorse: when improving performance
     *  - 🚱 :non-potable_water: when plugging memory leaks
     *  - 📝 :memo: when writing docs
     *  - 🐧 :penguin: when fixing something on Linux
     *  - 🍎 :apple: when fixing something on Mac OS
     *  - 🏁 :checkered_flag: when fixing something on Windows
     *  - 🐛 :bug: when fixing a bug
     *  - 🔥 :fire: when removing code or files
     *  - 💚 :green_heart: when fixing the CI build
     *  - ✅ :white_check_mark: when adding tests
     *  - 🔒 :lock: when dealing with security
     *  - ⬆️ :arrow_up: when upgrading dependencies
     *  - ⬇️ :arrow_down: when downgrading dependencies
     *  - 👕 :shirt: when removing linter warnings
     */
      emoji: `:${string}:`;
      shortDesc?: string;
    }

    /**
     * @see {@link https://github.com/conventional-changelog/conventional-changelog/blob/61573ecba6aea718b96365c96993d4fa7d53c6fd/packages/conventional-changelog-codemirror/src/parser.js#L3-L7 ParserOpts_CodeMirror}
     */
    interface CodeMirror extends _Base {
      language?: string;
      type?: string;
      message: string;
    }

    /**
     * @see {@link https://github.com/conventional-changelog/conventional-changelog/blob/61573ecba6aea718b96365c96993d4fa7d53c6fd/packages/conventional-changelog-conventionalcommits/src/parser.js#L3-L13 ParserOpts_ConventionalCommits}
     */
    interface ConventionalCommits extends Angular {
      type?: 'build' | 'chore' | 'ci' | 'docs' | 'feat' | 'feature' | 'fix' | 'perf' | 'refactor' | 'revert' | 'style' | 'test';
    }

    namespace Ember_Subtypes {
      interface Base extends _Base {
      /**
       * In general, almost all commits should fall into one of these categories.
       * In the cases where they don't, commit without a tag.
       */
        tag?:
          | 'BUGFIX'
          | 'CLEANUP'
          | 'DOC'
          | 'FEATURE'
          | 'SECURITY';
        /**
         * BUGFIX: 'beta' | 'release'
         * CLEANUP: 'beta'
         * DOCS: 'canary' | 'beta' | 'release'
         *  Default: 'canary'
         *  The most stable release the change applies to.
         * FEATURE: the flag of the feature
         * SECURITY: 'cve'
         * @example [BUGFIX beta], [BUGFIX release], [CLEANUP beta], [DOC canary], [DOC beta], [DOC release], [FEATURE <name>], [SECURITY cve]
         */
        taggedAs?: string;
        /** All text after '[$tag $taggedAs]' in the commit message */
        message?: string;
      }

      type None = Omit<Base, 'tag' | 'taggedAs'>;

      interface BUGFIX extends Base {
        tag: 'BUGFIX';
        taggedAs: 'beta' | 'release';
      }

      interface CLEANUP extends Base {
        tag: 'CLEANUP';
        taggedAs: 'beta';
      }

      interface DOC extends Base {
        tag: 'DOC';
        taggedAs: 'canary' | 'beta' | 'release';
      }

      interface FEATURE extends Base {
        tag: 'FEATURE';
        taggedAs: string;
      }

      interface SECURITY extends Base {
        tag: 'SECURITY';
        taggedAs: 'cve';
      }
    }

    type Ember
      = | Ember_Subtypes.None
        | Ember_Subtypes.BUGFIX
        | Ember_Subtypes.CLEANUP
        | Ember_Subtypes.DOC
        | Ember_Subtypes.FEATURE
        | Ember_Subtypes.SECURITY;

    /** Legacy; ESLint uses Conventional Commits. Source: https://eslint.org/docs/latest/contribute/pull-requests#step2 */
    interface ESLint extends _Base {
    /**
     * - Breaking - for a backwards-incompatible enhancement or feature.
     * - Build - changes to build process only.
     * - Chore - for refactoring, adding tests, etc. (anything that isn't user-facing).
     * - Docs - changes to documentation only.
     * - Fix - for a bug fix.
     * - New - implemented a new feature.
     * - Update - either for a backwards-compatible enhancement or for a rule change that adds reported problems.
     * - Upgrade - for a dependency upgrade.
     */
      tag: 'Breaking' | 'Build' | 'Chore' | 'Docs' | 'Fix' | 'New' | 'Update' | 'Upgrade';
      message?: string;
    }

    /** A derivation of Angular / Conventional Commits */
    interface Express extends _Base {
      /** @example 'build' | 'chore' | 'deps' | 'docs' | 'fix' | 'lint' | 'perf' | ... */
      component: Angular['type'] | 'deps' | 'lint';
      shortDesc?: string;
    }

    interface JQuery extends _Base {
      /** @example 'Event' | 'Autocomplete' */
      component?: string;
    }

    interface JSHint extends _Base {
      type: 'FIX' | 'FEAT' | 'DOCS' | 'TEST' | 'CHORE';
      shortDesc?: string;
    }
  }

  type RuleObject
    = | RuleObjects._Base
      | RuleObjects.Angular
      | RuleObjects.Atom
      | RuleObjects.CodeMirror
      | RuleObjects.ConventionalCommits
      | RuleObjects.Ember
      | RuleObjects.ESLint
      | RuleObjects.Express
      | RuleObjects.JQuery
      | RuleObjects.JSHint;
  // #endregion RuleObject

  // #region PresetConfig
  /**
   * Substitutions:
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#host host}
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#owner owner}
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#repository repository}
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#hash hash}
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#previoustype previousTag}
   * - {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#currenttag currentTag}
   */
  namespace PresetConfigs {
    interface _Base {
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#commiturlformat-string */
      commitUrlFormat?: string;
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#compareurlformat-string */
      compareUrlFormat?: string;
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#header-string */
      header?: string;
      /**
       * @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#issueprefixes-array-of-string
       * @example ['TEST-']
       */
      issuePrefixes?: string[];
      /**
       * @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#issueurlformat-string
       * @example 'https://myBugTracker.com/{{prefix}}{{id}}'
       */
      issueUrlFormat?: string;
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#premajor-boolean */
      preMajor?: boolean;
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#releasecommitmessageformat-string */
      releaseCommitMessageFormat?: string;
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#types */
      types?: { type: string; scope?: string; section?: string; hidden?: boolean }[];
      /** @see https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#userurlformat-string */
      userUrlFormat?: string;
    }

    interface ConventionalCommits extends _Base {
      /**
       * Regular expression to match and exclude commits from the changelog. Commits matching this pattern will be ignored.
       */
      ignoreCommits?: string | RegExp;
      /** Array of commit type objects defining which types to include in the changelog. Hidden types are excluded from the changelog but may still trigger version bumps. Default value accessible via `DEFAULT_COMMIT_TYPES` export. */
      types?: RuleObjects.ConventionalCommits;
      /** When `true`, version bumps occur only for breaking changes or non-hidden commit types. When `false` (default), any commit can trigger a version bump. */
      bumpStrict?: boolean;
      /** String or array of scope names to filter commits. Only commits with matching scopes will be included. When `scopeOnly` is `false` (default), commits without any scope are also included. */
      scope?: string | string[];
      /**
       * When `true` and `scope` is specified, excludes commits that have no scope. When `false` (default), includes both scoped and unscoped commits when filtering by scope.
       * @default false
       */
      scopeOnly?: boolean;
    }
  }

  type PresetConfig
    = | PresetConfigs._Base
      | PresetConfigs.ConventionalCommits;
  // #endregion PresetConfig

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
    /**
     * Additional configuration passed to the {@linkplain https://github.com/conventional-changelog/conventional-changelog conventional-changelog} preset.
     * Used for example with {@linkplain https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md conventional-changelog-conventionalcommits}.
     */
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
