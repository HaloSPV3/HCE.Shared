import type {
  PluginSpec,
  Options as SemanticReleaseOptions,
} from 'semantic-release';

/**
 * @since 3.0.0
 * @deprecated EXPERIMENTAL
 */
interface PluginInsertRuleSet {
  Id: string;
  BeforeIds: string[];
  AfterIds: string[];
}

/**
 * [W.I.P. STUB]
 *
 * Given an array of {@link PluginInsertRuleSet}s, insert plugins into a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone structured clone}
 * (i.e. deep-copy) of the {@link plugins} array, sort the plugin entries, and
 * return the modified array copy.
 * @todo implement
 * @param plugins Your {@link SemanticReleaseOptions.plugins} array.
 * @param inserts An array of {@link PluginInsertRuleSet}s.
 *
 * If a plugin is already in the plugins array, inserting is skipped. The
 * existing entry is sorted according to its ruleset.
 *
 * If any rulesets conflict, an error will be thrown.
 * - error: A must precede B; B must precede A.
 * - pass: C must precede D and E; D must precede E and follow B. Add ruleset
 *   interface: {Id:string, BeforeIds:string[], AfterIds:string[] }
 * @returns A deep-cloned, modified copy of {@link plugins} with plugins
 * inserted and sorted where needed.
 * @since 3.0.0
 * @deprecated EXPERIMENTAL
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare function insertAndSortPlugins(
  plugins: Exclude<SemanticReleaseOptions['plugins'], undefined>,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  inserts: PluginInsertRuleSet[]
): PluginSpec[];

/**
 * @param plugins {@link SemanticReleaseOptions.plugins}
 * @param afterPluginsIDs The `string` IDs of plugins that the {@link insertPluginIDs} must follow.
 * @param insertPluginIDs The `string` IDs of plugins to insert into a copy of the {@link plugins} array.
 * @param beforePluginsIDs The `string` IDs of plugins that the {@link insertPluginIDs} must precede.
 * @returns
 * A modified copy of {@link plugins} with the given plugins inserted
 * before {@link beforePluginsIDs} and after {@link afterPluginsIDs}.
 *
 * Inserted plugins will be a `[string, {}]` tuple.
 * @throws {ReferenceError} This should never occur. One or more of the
 * {@link afterPluginsIDs} had been found in {@link plugins}, but a `.find` call
 * to get the highest index of the found plugins had returned `undefined`
 * @throws {AggregateError} One or more error occurred when inserting plugins: `insertPlugin was instructed to insert one or more plugins after [${afterPluginsIDs.map(v => '"' + v + '"').join(', ')}] and before [${beforePluginsIDs.map(v => `"${v}"`).join(', ')}], but ${JSON.stringify(pluginIDs[indexOfLastAfter])} comes after ${JSON.stringify(pluginIDs[index])}!`
 */
export function insertPlugin(
  plugins: Exclude<PluginSpec, string>[],
  afterPluginsIDs: string[],
  insertPluginIDs: string[],
  beforePluginsIDs: string[],
): Exclude<PluginSpec, string>[] {
  const pluginIDs = plugins.map(v =>
    typeof v === 'string' ? v : v[0],
  );

  // if any beforePluginIDs are ordered before the last afterPlugin, throw. Impossible to sort.

  const indexOfLastAfter = afterPluginsIDs
    .filter(v => pluginIDs.includes(v))
    .map(v => pluginIDs.indexOf(v))
    .sort()
    .find((_v, i, obj) => i === obj.length - 1);
  if (undefined === indexOfLastAfter)
    throw new ReferenceError(
      'An attempt to get the last element of an array returned undefined.',
    );

  const indicesOfBefore = beforePluginsIDs
    .filter(v => pluginIDs.includes(v))
    .map(v => pluginIDs.indexOf(v))
    .sort();

  // This for-of collects *all* sorting errors. The resulting AggregateError
  // notifies the API user of *all* errors in the order rather than just the
  // first error encountered.
  const errors: Error[] = [];
  for (const index of indicesOfBefore) {
    if (index <= indexOfLastAfter) {
      errors.push(
        new Error(
          `insertPlugin was instructed to insert one or more plugins after [${afterPluginsIDs.map(v => '"' + v + '"').join(', ')}] and before [${beforePluginsIDs.map(v => `"${v}"`).join(', ')}], but ${JSON.stringify(pluginIDs[indexOfLastAfter])} comes after ${JSON.stringify(pluginIDs[index])}!`,
        ),
      );
    }
  }
  if (errors.length > 0)
    throw new AggregateError(errors, 'One or more errors occurred while inserting plugin configs into the Semantic Release config!');

  // insert plugin(s)

  const beforeInsert = plugins.slice(0, indexOfLastAfter + 1);
  const afterInsert = plugins.slice(indexOfLastAfter + 1, plugins.length + 1);

  return [
    ...beforeInsert,
    ...insertPluginIDs.map(id =>
      [id, {}] as [string, unknown],
    ),
    ...afterInsert,
  ];
}
