import type { AssetEntry, Options as GitOptions } from '@semantic-release/git'
import type { PluginSpec } from 'semantic-release'

export const GitPluginId = '@semantic-release/git'
/**
 * As specified at https://github.com/semantic-release/git#options
 * To use, assign or create an object with the same (but mutable) properties and deeply-copy to the object
 * @satisfies { GitOptions }
 */
export const DefaultOptions = {
  assets: ['README.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json'],
  message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
} as const satisfies GitOptions

function gitAssetsToArray(assets: AssetEntry | AssetEntry[] | false | undefined) {
  if (assets === undefined || assets === false) return []
  if (Array.isArray(assets)) return assets
  if (typeof assets === 'string') return [assets]
  return assets.path === 'string' ? [assets.path] : []
}

/**
 * https://github.com/semantic-release/git#options
 *
 * This plugin may be deprecated at a later date.
 * Why do you need to commit during release?
 * If you don't need to update a changelog or version in a file, then you don't need this.
 *
 * @returns A {@link PluginSpec} array with {@link PluginSpec<GitOptions>}. If Git plugin not in original array, returns the original array.
 * todo: deprecate for generic or parameterized function
 */
export function setupGitPluginSpec(plugins: PluginSpec[]): PluginSpec[] {
  let newPlugins = plugins
  let gitPluginIndex = -1

  function pluginSpecIsGit(pluginSpec: PluginSpec, pluginSpecIndex: number) {
    if (pluginSpec === GitPluginId || pluginSpec[0] === GitPluginId) {
      gitPluginIndex = pluginSpecIndex
      return true
    }
    return false
  }

  // if Git plugin not in load order, return as-is.
  if (!newPlugins.some(pluginSpecIsGit)) return plugins

  // if string, replace with tuple with default options.
  newPlugins = newPlugins.map(plugin =>
    plugin === GitPluginId ? [GitPluginId, DefaultOptions] : plugin,
  );

  // ensure assets is an array
  (newPlugins[gitPluginIndex][1] as GitOptions).assets = gitAssetsToArray(
    (newPlugins[gitPluginIndex][1] as GitOptions).assets,
  )

  const discardPile: number[] = []

  // de-duplicate Git plugin entries; assign single entry to newPlugins[gitPluginIndex]
  newPlugins.forEach((current, i) => {
    if (i > gitPluginIndex && pluginSpecIsGit(current, gitPluginIndex)) {
      // convert its assets to an array
      const { assets } = newPlugins[i][1] as GitOptions
      const { message } = newPlugins[i][1] as GitOptions
      // push unique assets to first entry's assets array
      if (assets !== undefined)
        ((newPlugins[gitPluginIndex][1] as GitOptions).assets as AssetEntry[]).push(
          ...gitAssetsToArray(assets),
        )
      if (message !== undefined) (newPlugins[gitPluginIndex][1] as GitOptions).message = message
      discardPile.push(i)
    }
  })
  for (const i of discardPile.sort().reverse()) {
    newPlugins.splice(i, 1)
  }

  return newPlugins
}
