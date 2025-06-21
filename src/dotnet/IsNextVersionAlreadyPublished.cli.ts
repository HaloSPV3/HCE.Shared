import { NugetRegistryInfo, getGithubOutput } from './NugetRegistryInfo.js';

const args = process.argv.slice(2);

// Parse command-line arguments - https://stackoverflow.com/a/76298476/14894786
const options: {
  packageId?: string;
  source?: string;
} & Record<string, string> = {};
for (let i = 0; i < args.length; i += 2) {
  const argName = args[i];
  const argValue = args[i + 1];
  if (argValue !== undefined && argName?.startsWith('--') === true && options[argName.slice(2)] !== undefined) {
    options[argName.slice(2)] = argValue;
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
