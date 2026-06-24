import * as console from 'node:console';
import { NugetRegistryInfo, getGithubOutput } from './NugetRegistryInfo.ts';
import esMain from 'es-main';

/**
 * @returns if successful
 * @throws {Error} if...
 * - {@link process.argv} does not include...
 *   - `--packageId [string]`
 *   - `--source [string]`
 * - Value of `await getGithubOutput())['new-release-version']`...
 *   - is not a valid Version
 *   - already exists at `source`
 */
async function main(): Promise<0> {
  const arguments_ = process.argv.slice(2);
  // Parse command-line arguments - https://stackoverflow.com/a/76298476/14894786
  const options: {
    packageId: string | undefined;
    source: string | undefined;
  } & Record<string, string | undefined> = { packageId: undefined, source: undefined };
  for (let index = 0; index < arguments_.length; index += 2) {
    const argumentName = arguments_[index];
    const argumentValue = arguments_[index + 1];
    if (argumentValue !== undefined && argumentName?.startsWith('--') === true) {
      options[argumentName.slice(2)] = argumentValue;
    }
  }

  if (typeof options.packageId !== 'string')
    throw new Error('packageId must be a string');
  if (typeof options.source !== 'string')
    throw new Error('source must be a string');

  const packageId = options.packageId,
    source = options.source,
    versionPattern = new RegExp(/\d+\.\d+\.\d+([-+].+)?/);
  const ghOutput = await getGithubOutput() ?? {};
  const matches = versionPattern.exec(ghOutput['new-release-version'] ?? '');
  if (matches === null || matches.length === 0)
    throw new Error(
      'The variable new-release-version is not present in the GITHUB_OUTPUT env file or its value contains invalid characters.',
    );

  const nextVersion = matches[0];
  const isPublished = await NugetRegistryInfo.IsNextVersionAlreadyPublished(
    source,
    packageId,
    nextVersion,
  );

  if (typeof isPublished !== 'boolean')
    throw new Error('isPublished is not a boolean');
  if (isPublished)
    throw new Error(`${packageId}@${nextVersion} already exists at ${source}.`);
  console.log(`OK: ${packageId}@${nextVersion} does NOT yet exist at ${source}. Yay.`);

  return 0;
}

if (esMain(import.meta))
  await main();
