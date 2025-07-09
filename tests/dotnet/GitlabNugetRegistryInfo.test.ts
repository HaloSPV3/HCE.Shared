import { deepStrictEqual, notDeepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GitlabNugetRegistryInfo as GLNRI, GLNRIOpts } from '../../src/dotnet/GitlabNugetRegistryInfo.js';
import { getEnvVarValue } from '../../src/utils/env.js';
import { isNativeError } from 'node:util/types';

await describe('GitlabNugetRegistryInfo', async () => {
  await describe('CI_API_V4_URL', async () => {
    await it('has the correct default value if the environment variable is undefined', () => {
      delete process.env['CI_API_V4_URL'];
      strictEqual(GLNRI.CI_API_V4_URL, 'https://gitlab.com/api/v4');
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

await describe('InstanceOf GitlabNugetRegistryInfo', async () => {
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js');

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
});

await describe('GLNRIOpts', { concurrency: false }, async () => {
  const GLNRIOptsOwn = GLNRIOpts.omit('project');

  await it('defaults to project-level endpoint', () => {
    strictEqual(
      GLNRIOptsOwn.from({}).source,
      `${GLNRI.CI_API_V4_URL}/projects/${GLNRI.projectId ?? 'placeholder'}/packages/nuget/index.json`,
    );
  });

  await it('defaults to GitLab token variables', () => {
    deepStrictEqual(
      GLNRIOptsOwn.from({}).tokenEnvVars,
      Object.freeze([
        'CI_JOB_TOKEN',
        'GITLAB_TOKEN',
        'GL_TOKEN',
      ] as const),
    );
  });
});
