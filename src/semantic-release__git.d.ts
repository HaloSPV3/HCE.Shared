/* eslint-disable jsdoc/tag-lines, jsdoc/require-param, jsdoc/require-returns */
/**
 * @see {@link ../node_modules/@semantic-release/git/index.js}
 */
declare module '@semantic-release/git' {
  import type { GlobalConfig, PrepareContext, VerifyConditionsContext } from 'semantic-release';
  export type MicromatchGlob = string;
  export interface AssetObject {
    path: MicromatchGlob;
  }
  export type AssetEntry = AssetObject | MicromatchGlob;
  export interface Options {
    /**
     * Files to include in the release commit. Set to `false` to disable adding files to the release commit.
     * @default ['CHANGELOG.md','package.json','package-lock.json','npm-shrinkwrap.json']
     * @description
     * Can be an Array or a single entry. Each entry can be either:
     * - a glob
     * - or an Object with a path property containing a glob.
     *
     * Each entry in the assets Array is globbed individually. A glob can be a String ("dist/\*\*\/\*.js" or "dist/mylib.js") or an Array of Strings that will be globbed together (["dist/\*\*", "!\*\*\/\*.css"]).
     *
     * If a directory is configured, all the files under this directory and its children will be included.
     *
     * Note: If a file has a match in assets it will be included even if it also has a match in .gitignore.
     *
     * @example
     * // include all js files in the dist directory, but not in its sub-directories.
     * 'dist/*.js'
     * // include all js files in the dist directory and its sub-directories.
     * 'dist/**\/*.js'
     * // include all files in the dist directory and its sub-directories excluding the css files.
     * [['dist', '!**\/*.css']]
     * // include package.json and all files in the dist directory and its sub-directories excluding the css files.
     * [['dist', '!**\/*.css'], 'package.json']
     * // include all js and css files in the dist directory and its sub-directories excluding the minified version.
     * [['dist/**\/*.{js,css}', '!**\/*.min.*']]
     */
    assets?: AssetEntry | AssetEntry[] | false;
    /**
     * The message for the release commit.
     * @default `chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}`
     * @description
     * The message for the release commit is generated with Lodash template. The following variables are available:
     * | Parameter         | Description |
     * | ----------------- | ----------- |
     * | branch            | The branch from which the release is done. |
     * | branch.name       | The branch name. |
     * | branch.type       | The type of branch. |
     * | branch.channel    | The distribution channel on which to publish releases from this branch. |
     * | branch.range      | The range of semantic versions to support on this branch. |
     * | branch.prerelease | The pre-release detonation to append to semantic versions released from this branch. |
     * | lastRelease       | Object with version, gitTag and gitHead of the last release. |
     * | nextRelease       | Object with version, gitTag, gitHead and notes of the release being done. |
     *
     * Note: It is recommended to include `[skip ci]` in the commit message to not trigger a new build. Some CI service support the `[skip ci]` keyword only in the subject of the message.
     *
     * #### `message` examples
     * The `message` `Release <%= nextRelease.version %> - <%= new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) %> [skip ci]\n\n<%= nextRelease.notes %>` will generate the commit message:
     * > Release v1.0.0 - Oct. 21, 2015 1:24 AM [skip ci]
     * >
     * > ## 1.0.0
     * >
     * > ### Features
     * > * Generate 1.21 gigawatts of electricity
     * >
     * > ...
     *
     */
    message?: string;
  }

  function verifyConditions(
    pluginConfig: Options,
    context: VerifyConditionsContext & {
      options: {
        prepare: unknown;
      };
    },
  ): void;
  function prepare(
    pluginConfig: Options,
    context: PrepareContext & {
      options: GlobalConfig;
    },
  ): Promise<void>;
  export { prepare, verifyConditions };
}
