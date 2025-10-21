import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it, test } from 'node:test';
import { GitlabNugetRegistryInfo as GLNRI, GLNRIOpts } from '../../src/dotnet/GitlabNugetRegistryInfo.js';
import { getEnvVarValue } from '../../src/utils/env.js';

await describe('GLNRI:undefinedEnv)', { concurrency: true }, async () => {
  await test('CI_API_V4_URL has the correct default value if the environment variable is undefined', () => {
    delete process.env['CI_API_V4_URL'];
    strictEqual(GLNRI.CI_API_V4_URL, 'https://gitlab.com/api/v4');
  });

  await test('ownerId returns undefined if CI_PROJECT_NAMESPACE_ID is undefined', () => {
    process.env['CI_PROJECT_NAMESPACE_ID'] = 'undefined';
    strictEqual(GLNRI.ownerId, undefined);
  });

  await test('projectId returns undefined if CI_PROJECT_ID is undefined', () => {
    process.env['CI_PROJECT_ID'] = 'undefined';
    strictEqual(GLNRI.projectId, undefined);
  });
});

await describe('GLNRI', { concurrency: true }, async () => {
  await test('groupUrl returns the expected url when CI_PROJECT_NAMESPACE_ID is defined', () => {
    process.env['CI_PROJECT_NAMESPACE_ID'] = 'placeholder';
    strictEqual(
      GLNRI.groupUrl,
      `${GLNRI.CI_API_V4_URL}/groups/${GLNRI.ownerId ?? 'placeholder'}/-/packages/nuget/index.json`,
    );
  });

  await test('projectUrl returns the expected url when CI_PROJECT_ID is defined', () => {
    if (!getEnvVarValue('CI_PROJECT_ID'))
      process.env['CI_PROJECT_ID'] = 'placeholder';
    strictEqual(
      GLNRI.projectUrl,
      `${GLNRI.CI_API_V4_URL}/projects/${GLNRI.projectId ?? 'placeholder'}/packages/nuget/index.json`,
    );
  });

  await test('ownerId returns string if CI_PROJECT_NAMESPACE_ID is defined', () => {
    if (!getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
      process.env['CI_PROJECT_NAMESPACE_ID'] = 'placeholder';
    strictEqual(GLNRI.ownerId, getEnvVarValue('CI_PROJECT_NAMESPACE_ID'));
  });

  await test('projectId returns string if CI_PROJECT_ID is defined', () => {
    if (!getEnvVarValue('CI_PROJECT_ID'))
      process.env['CI_PROJECT_ID'] = 'placeholder';
    strictEqual(GLNRI.projectId, getEnvVarValue('CI_PROJECT_ID'));
  });
});

await describe('InstanceOf GitlabNugetRegistryInfo', async () => {
  await it('canPushPackagesToSource', { skip: 'See ./DotnetNugetPush.test.ts' });
});

await describe('GLNRIOpts', { concurrency: true }, async () => {
  await it('defaults to project-level endpoint', () => {
    strictEqual(
      GLNRIOpts.pick('source').from({}).source,
      `${GLNRI.CI_API_V4_URL}/projects/${GLNRI.projectId ?? 'placeholder'}/packages/nuget/index.json`,
    );
  });

  await it('defaults to GitLab token variables', () => {
    deepStrictEqual(
      GLNRIOpts.pick('tokenEnvVars').from({}).tokenEnvVars,
      Object.freeze([
        'GL_TOKEN',
        'GITLAB_TOKEN',
        'CI_JOB_TOKEN',
      ] as const),
    );
  });
});
