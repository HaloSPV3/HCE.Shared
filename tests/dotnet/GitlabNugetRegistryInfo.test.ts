import { ok, notDeepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GitlabNugetRegistryInfo as GLNRI } from '../../src/dotnet/GitlabNugetRegistryInfo.js';
import { getEnv, getEnvVarValue } from '../../src/utils/env.js';
import { isNativeError } from 'node:util/types';
import { inspect } from 'node:util';

await describe('GitlabNugetRegistryInfo', async () => {
  await describe('CI_API_V4_URL', async () => {
    const expectedValue = 'https://gitlab.com/api/v4';

    await it('has the correct default value if the environment variable is undefined', () => {
      delete process.env['CI_API_V4_URL'];
      strictEqual(GLNRI.CI_API_V4_URL, expectedValue);
    });

    // await it("has the correct value the value is provided by the environment variable")
  });

  await describe('groupUrl', async () => {
    await it('returns the expected url when CI_PROJECT_NAMESPACE_ID is defined', () => {
      process.env['CI_PROJECT_NAMESPACE_ID'] = 'placeholder';
      strictEqual(
        GLNRI.groupUrl,
        `${GLNRI.CI_API_V4_URL}/groups/${GLNRI.ownerId ?? 'placeholder'}/-/packages/nuget/index.json`,
      );
    });
  });

  await describe('projectUrl', async () => {
    await it('returns the expected url when CI_PROJECT_ID is defined', () => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        process.env['CI_PROJECT_ID'] = 'placeholder';
      strictEqual(
        GLNRI.projectUrl,
        `${GLNRI.CI_API_V4_URL}/projects/${GLNRI.projectId ?? 'placeholder'}/packages/nuget/index.json`,
      );
    });
  });

  await describe('ownerId', async () => {
    await it('returns undefined if CI_PROJECT_NAMESPACE_ID is undefined', (t) => {
      delete process.env['CI_PROJECT_NAMESPACE_ID'];
      if (getEnvVarValue('CI_PROJECT_NAMESPACE_ID')) {
        t.skip(
          'This test requires CI_PROJECT_NAMESPACE_ID be undefined. It is defined in .env file and so it is too annoying to work around.',
        );
        return;
      }
      strictEqual(GLNRI.ownerId, undefined);
    });

    await it('returns string if CI_PROJECT_NAMESPACE_ID is defined', () => {
      if (!getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
        process.env['CI_PROJECT_NAMESPACE_ID'] = 'placeholder';
      strictEqual(GLNRI.ownerId, process.env['CI_PROJECT_NAMESPACE_ID']);
    });
  });

  await describe('projectId', async () => {
    await it('returns undefined if CI_PROJECT_ID is undefined', (t) => {
      delete process.env['CI_PROJECT_ID'];
      if (getEnvVarValue('CI_PROJECT_ID')) {
        t.skip(
          'This test requires CI_PROJECT_ID be undefined. It is defined in .env file and so it is too annoying to work around.',
        );
        return;
      }
      strictEqual(GLNRI.projectId, undefined);
    });

    await it('returns string if CI_PROJECT_ID is defined', () => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        process.env['CI_PROJECT_ID'] = 'placeholder';
      strictEqual(GLNRI.projectId, process.env['CI_PROJECT_ID']);
    });
  });
});

await describe('InstanceOf GitlabNugetRegistryInfo', { concurrency: 1 }, async () => {
  if (!getEnvVarValue('CI_JOB_TOKEN'))
    process.env['CI_JOB_TOKEN'] = 'placeholder';
  if (!getEnvVarValue('CI_PROJECT_ID'))
    process.env['CI_PROJECT_ID'] = 'placeholder';
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js');

  const defaultWithPlaceholders = new GLNRI({
    project: DeterministicNupkgCsproj,
  });

  await it('defaults to project-level endpoint', () => {
    if (!getEnvVarValue('CI_PROJECT_ID'))
      process.env['CI_PROJECT_ID'] = 'placeholder';
    if (!getEnvVarValue('CI_JOB_TOKEN'))
      process.env['CI_JOB_TOKEN'] = 'placeholder';
    const expected = `${GLNRI.CI_API_V4_URL}/projects/${GLNRI.projectId ?? 'placeholder'}/packages/nuget/index.json`;
    strictEqual(
      new GLNRI({ project: DeterministicNupkgCsproj }).source,
      expected,
    );
  });

  await it('can be configured to use group-level endpoint', () => {
    if (!getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
      process.env['CI_PROJECT_NAMESPACE_ID'] = 'placeholder';
    if (!getEnvVarValue('CI_JOB_TOKEN'))
      process.env['CI_JOB_TOKEN'] = 'placeholder';
    const expected = `${GLNRI.CI_API_V4_URL}/groups/${GLNRI.ownerId ?? 'placeholder'}/-/packages/nuget/index.json`;
    strictEqual(
      new GLNRI({
        project: DeterministicNupkgCsproj,
        source: 'group',
      }).source,
      expected,
    );
  });

  await it('throws if default values and no token available', (t) => {
    const { CI_JOB_TOKEN, GL_TOKEN, GITLAB_TOKEN } = getEnv();
    delete process.env['CI_JOB_TOKEN'];
    delete process.env['GL_TOKEN'];
    delete process.env['GITLAB_TOKEN'];
    if (
      getEnvVarValue('CI_JOB_TOKEN')
      || getEnvVarValue('GL_TOKEN')
      || getEnvVarValue('GITLAB_TOKEN')
    ) {
      t.skip(
        'one or more tokens (CI_JOB_TOKEN, GL_TOKEN, GITLAB_TOKEN) is defined in .env file',
      );
      return;
    }

    let value: GLNRI | Error;
    try {
      value = new GLNRI({ project: DeterministicNupkgCsproj });
    }
    catch (error) {
      value = isNativeError(error) ? error : new Error(JSON.stringify(error));
    }

    ok(isNativeError(value));

    if (CI_JOB_TOKEN) process.env['CI_JOB_TOKEN'] = CI_JOB_TOKEN;
    if (GL_TOKEN) process.env['GL_TOKEN'] = GL_TOKEN;
    if (GITLAB_TOKEN) process.env['GITLAB_TOKEN'] = GITLAB_TOKEN;
  });

  /** NuGet Client credential failover */
  await it('does NOT throw when custom values and no token available', () => {
    let value: GLNRI | Error;
    try {
      value = new GLNRI({
        project: DeterministicNupkgCsproj,
        tokenEnvVars: [
          'UNDEFINED_TOKEN',
          'ANOTHER_UNDEFINED_TOKEN',
        ],
      });
    }
    catch (error) {
      value = isNativeError(error) ? error : new Error(JSON.stringify(error));
    }
    ok(!isNativeError(value), `\`value\` should \`true\`, but it's actually ${inspect(value, true, Infinity)}`);
  });

  await it('canPushPackagesToSource', async () => {
    await it('returns rejected Promise when _ANY_ Error occurs', async () => {
      process.env['INVALID_TOKEN'] = 'INVALID_TOKEN';
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const result: true | Error = await new GLNRI({ project: DeterministicNupkgCsproj, tokenEnvVars: ['INVALID_TOKEN'] }).canPushPackagesToSource
        .catch((error: unknown) => isNativeError(error) ? error : new Error(JSON.stringify(error)));
      notDeepStrictEqual(result, true);
    });

    await it('returns resolved Promise<true> when _no_ errors occur', async (t) => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        t.skip('CI_PROJECT_ID is undefined');

      const project = new GLNRI({ project: DeterministicNupkgCsproj });
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const result: true = await project.canPushPackagesToSource;
      strictEqual(result, true);
    });
  });

  await describe('resolvedEnvVariable', async () => {
    await it('is a string', () => {
      strictEqual(
        typeof defaultWithPlaceholders.resolvedEnvVariable,
        'string',
      );
    });
  });

  await describe('source', async () => {
    await it('is a string', () => {
      strictEqual(typeof defaultWithPlaceholders.source, 'string');
    });
  });
});
