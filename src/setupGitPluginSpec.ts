import type { AssetEntry, Options as GitOptions } from '@semantic-release/git';
import type { PluginSpecSRGit, PluginSpecTuple } from './semanticReleaseConfig.js';

export const GitPluginId = '@semantic-release/git';

/**
 * As specified at https://github.com/semantic-release/git#options
 * To use, assign or create an object with the same (but mutable) properties and deeply-copy to the object
 * @satisfies { GitOptions }
 */
export const DefaultOptions: {
  readonly assets: ['README.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json'];
  readonly message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}';
} = {
  assets: [
    'README.md',
    'CHANGELOG.md',
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
  ],
  message:
    'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
} as const satisfies GitOptions;

/**
 * Check if {@link unk} is an {@link AssetEntry}.
 * @param unk Anything.
 * @returns `true` if {@link unk} is an {@link AssetEntry}. Else, `false`.
 */
function isGitAsset(unk: unknown): unk is AssetEntry {
  if (typeof unk === 'string')
    return true;
  // Avoid ending condition with `typeof unk.path === 'string'`.
  // TS narrowing is bugged; requires the check to be performed TWICE!!
  if (typeof unk === 'object' && unk != undefined && 'path' in unk) {
    return typeof unk.path === 'string';
  }
  return false;
}

/**
 * Convert one or more {@link AssetEntry AssetEntries} to a `string[]`.
 * @param assets The `assets` property of a {@link GitOptions} object. This may not be `false`.
 * @returns A `string[]` of the given {@link AssetEntry} objects or strings.
 */
function gitAssetsToStringArray(
  assets: Exclude<GitOptions['assets'], false>,
): string[] {
  if (assets === undefined)
    return [];
  if (Array.isArray(assets)) {
    return assets.filter(asset => isGitAsset(asset))
      .map(v => typeof v === 'string' ? v : v.path);
  }
  if (typeof assets === 'string')
    return [assets] as string[];
  if (typeof assets.path === 'string')
    return [assets.path];
  else
    throw new TypeError('assets is not typeof GitOptions[\'assets\'!');
}

/**
 * Sanitize a {@link GitOptions} object so its {@link GitOptions#assets} property is either `false` or a `string[]`.
 * @param opts A {@link GitOptions} object.
 * @returns A {@link GitOptions} object whose {@link GitOptions#assets} is `string[] | false`.
 */
function sanitizeGitOptions(opts: GitOptions): Omit<GitOptions, 'assets'> & { assets: string[] | false } {
  return { ...opts, assets: opts.assets === false ? opts.assets : gitAssetsToStringArray(opts.assets) };
}

/**
 *Determine if {@link opts} is a {@link GitOptions} object.
 * @param opts Anything.
 * @returns `true` if {@link opts} is a {@link GitOptions} object. Else, `false`.
 */
function isGitOptions(opts: unknown): opts is GitOptions {
  let isOptions = false;

  if (typeof opts !== 'object' || opts == undefined)
    return isOptions;
  if ('assets' in opts) {
    isOptions = Array.isArray(opts.assets)
      ? opts.assets.every(unk => isGitAsset(unk))
      : isGitAsset(opts.assets);
  }
  if ('message' in opts)
    isOptions = typeof opts.message === 'string';
  return isOptions;
}

/**
 * Determine if {@link pluginSpec} includes a {@link GitOptions} object.
 * @param pluginSpec a {@link PluginSpecTuple}.
 * @returns `true` if {@link pluginSpec[1]} is a {@link GitOptions} object. Else, `false`.
 */
function hasGitOptions<P extends string>(pluginSpec: PluginSpecTuple<P>): pluginSpec is PluginSpecTuple<P, GitOptions> {
  return isGitOptions(pluginSpec[1]);
};

/**
 * Determined if the plugin ID in {@link pluginSpec} is {@link GitPluginId}.
 * @param pluginSpec A {@link PluginSpecTuple}
 * @returns `true` if {@link pluginSpec[0]} is {@link GitPluginId}
 */
function isGitPluginSpecTuple<T>(pluginSpec: [string, T]): pluginSpec is [typeof GitPluginId, T] {
  return pluginSpec[0] === GitPluginId;
}

/**
 * https://github.com/semantic-release/git#options
 *
 * This plugin may be deprecated at a later date.
 * Q: Why would I need to commit during release?
 * A: This is for committing your changelog, README, and/or other files updated during the release procedure.
 * @param plugins An ordered array of {@link PluginSpecTuple PluginSpecTuples}.
 * @returns A {@link PluginSpecTuple}[]. Duplicate `@semantic-release/git` plugin entries are merged or overridden. The last entry takes priority e.g. if the last entry is `{assets: false}`, previous entries' assets are ignored.
 */
export function setupGitPluginSpec(plugins: PluginSpecTuple[]): PluginSpecTuple[] {
  /** if Git plugin not in load order, return as-is. */
  const firstGitPluginIndex = plugins.findIndex(plugin => isGitPluginSpecTuple(plugin));
  if (firstGitPluginIndex === -1)
    return plugins;

  /**
   * the following two const variables are references--not clones.
   * Modifying them will affect the plugins array.
   */
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const firstGitPlugin = plugins[firstGitPluginIndex]!;
  const firstGitOpts: ReturnType<typeof sanitizeGitOptions> = isGitOptions(firstGitPlugin[1])
    ? sanitizeGitOptions(firstGitPlugin[1])
    : DefaultOptions;

  /**
   * remove duplicate Git plugin entries;
   * merge extra options into firstGitPlugin's options
   * if `firstGitOpts.assets === false`, do not change it.
   * All duplicate PluginSpecSRGit entries are then reassigned `undefined` and all
   * `undefined` items are filtered from the plugins array.
   */
  return plugins.map((current: PluginSpecTuple, index): PluginSpecTuple | PluginSpecSRGit | undefined => {
    // skip everything up to and including the first Git PluginSpec
    if (index <= firstGitPluginIndex || !isGitPluginSpecTuple(current))
      return current;

    /** if another Git PluginSpec is discovered, copy its options to the first Git PluginSpec and return undefined. */
    if (hasGitOptions(current)) {
      const currentGitOpts = sanitizeGitOptions(current[1]);

      if (currentGitOpts.assets === false) {
        firstGitOpts.assets = false;
      }
      else {
        const assets: string[] = gitAssetsToStringArray(currentGitOpts.assets);
        if (Array.isArray(firstGitOpts.assets)) {
          firstGitOpts.assets.push(...assets);
        }
        else {
          firstGitOpts.assets = assets;
        }
      }

      if (typeof currentGitOpts.message === 'string')
        firstGitOpts.message = currentGitOpts.message;
    }
    return undefined;
  }).filter(pluginSpec => pluginSpec !== undefined);
}
