import type { Options as SRCommitAnalyzerOptions } from '@semantic-release/commit-analyzer';
import type { Options as SRExecOptions } from '@semantic-release/exec';
import type { Options as SRGitOptions } from '@semantic-release/git';
import type { Options as SRGithubOptions } from '@semantic-release/github';
import type { Options, PluginSpec } from 'semantic-release';
import { DefaultOptions } from './setupGitPluginSpec.js';

export interface SRReleaseNotesGeneratorOptions {
  /**
   * conventional-changelog preset.
   * @default 'angular'
   */
  preset?: 'angular' | 'atom' | 'codemirror' | 'ember' | 'eslint' | 'express' | 'jquery' | 'jscs' | 'jshint' | 'conventionalcommits' | (string & Record<never, never>) | undefined;
  /**
   * Requireable npm package with a custom conventional-changelog preset.
   */
  config?: string | undefined;
  /**
   * Additional `conventional-changelog-parser` options that will overwrite ones loaded by `preset` or `config`.
   */
  parserOpts: object;
  /**
   * Additional `conventional-changelog-writer` options that will overwrite ones loaded by `preset` or `config`.
   */
  writerOpts: object;
}

/**
 * A two-type PluginSpec to tie a plugin's name to its Options type. This is
 * intended for use by plugins to associate their Options type with their plugin
 * name.
 */
export type PluginSpecTuple<P extends string = string, T = unknown> = [P, T];
export type PluginSpecSRCommitAnalyzer<V extends SRCommitAnalyzerOptions = SRCommitAnalyzerOptions> = PluginSpecTuple<'@semantic-release/commit-analyzer', V>;
export type PluginSpecSRChangelog<V extends Record<'changelogFile' | 'changelogTitle', string>> = PluginSpecTuple<'@semantic-release/changelog', V>;
export type PluginSpecExportData<V extends Record<string, unknown> = Record<string, unknown>> = PluginSpecTuple<'semantic-release-export-data', V>;
export type PluginSpecSRReleaseNotesGen<V extends SRReleaseNotesGeneratorOptions = SRReleaseNotesGeneratorOptions> = PluginSpecTuple<'@semantic-release/release-notes-generator', V>;
export type PluginSpecSRExec<V extends SRExecOptions = SRExecOptions> = PluginSpecTuple<'@semantic-release/exec', V>;
export type PluginSpecSRGit<V extends SRGitOptions = SRGitOptions> = PluginSpecTuple<'@semantic-release/git', V>;
export type PluginSpecSRGithub<V extends SRGithubOptions = SRGithubOptions> = PluginSpecTuple<'@semantic-release/github', V>;

/**
 * @satisfies { Readonly<PluginSpec[]> }
 */
export const defaultPlugins = Object.freeze([
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  '@semantic-release/npm',
  '@semantic-release/github',
] as const) satisfies readonly PluginSpec[];

// define as const for string literals in type, then...
/**
 *  @see baseConfig
 */
const _baseConfig = {
  /** @see https://semantic-release.gitbook.io/semantic-release/usage/plugins#plugin-options-configuration */
  preset: 'conventionalcommits' as const,
  branches: [
    'main',
    { name: 'develop', channel: 'develop', prerelease: true },
  ] as ['main', { name: 'develop'; channel: 'develop'; prerelease: true }],
  plugins: [
    ['@semantic-release/commit-analyzer', {}],
    ['semantic-release-export-data', {}],
    ['@semantic-release/release-notes-generator', {}],
    ['@semantic-release/changelog', {}],
    ['@semantic-release/git', DefaultOptions],
    ['@semantic-release/exec', {}],
    ['@semantic-release/github', { addReleases: 'bottom', assets: ['./publish/*', '!./publish/.gitkeep'] }],
  ] as [
    PluginSpecSRCommitAnalyzer,
    PluginSpecExportData,
    PluginSpecSRReleaseNotesGen,
    PluginSpecSRChangelog<Record<'changelogFile' | 'changelogTitle', string>>,
    PluginSpecSRGit<typeof DefaultOptions>,
    PluginSpecSRExec,
    PluginSpecSRGithub<{ addReleases: 'bottom'; assets: [{ path: './publish/*' }] }>,
  ] | Exclude<PluginSpec, string>[],
};

/**
 * The base configuration for various Semantic Release scenarios.
 * - Prefers preset "conventionalcommits"
 *   (Conventional-Changelog-ConventionalCommits).
 * - Creates tags and release commits on "main" branch, pre-releases on
 *   "develop" branch in "develop" channel.
 * - Creates GitHub Releases.
 * - Exports the following variables as GitHub Actions outputs:
 *   - "new-release-published": "true" | "false"
 *   - "new-release-version" : string
 *   - "new-release-git-tag" : string
 * - includes default plugins (except `@semantic-release/npm`) and more
 *   - `@semantic-release/commit-analyzer`
 *   - semantic-release-export-data
 *   - `@semantic-release/release-notes-generator`
 *   - `@semantic-release/changelog`
 *   - `@semantic-release/git`
 *     - add modified CHANGELOG.md in release commit
 *   - `@semantic-release/exec`
 *     - does nothing by default. Included for convenience.
 *   - `@semantic-release/github`
 *     - uploads all files from `./publish/*`. This is non-recursive.
 *     - adds a list of links to related release pages (e.g. the release's page on npmjs.com)
 *
 * (OPTIONAL) update static Version strings before Git plugin
 * - https://github.com/jpoehnelt/semantic-release-replace-plugin
 * - https://github.com/droidsolutions/semantic-release-update-file
 * @satisfies {Options}
 */
export const baseConfig: typeof _baseConfig = _baseConfig satisfies Options;
