import {
  deepStrictEqual,
  strictEqual,
} from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
// eslint-disable-next-line unicorn/import-style
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';
import {
  NugetRegistryInfo as NRI,
  NRIOpts as NRIOptions,
  NRIOptsBase as NRIOptionsBase,
  getGithubOutput,
  getGithubOutputSync,
} from '../../src/dotnet/NugetRegistryInfo.ts';
import { isConstructor } from '../../src/utils/reflection/isConstructor.ts';
import * as process from 'node:process';

if (!existsSync(path.join(tmpdir(), 'HCE.Shared')))
  mkdirSync(path.join(tmpdir(), 'HCE.Shared'));

await describe('NugetRegistryInfo', async () => {
  await it('is a class', () => {
    deepStrictEqual(isConstructor(NRI), true);
  });
});

await describe('InstanceOf NugetRegistryInfo', async () => {
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.ts');

  await it('canPushPackagesToSource', { skip: 'See ./DotnetNugetPush.test.ts' });

  /** NuGet Client credential failover */
  await it('Continues when API key unavailable', () => {
    const nri = new NRI({
      project: DeterministicNupkgCsproj,
      source: 'placeholder',
      tokenEnvVars: [
        'UNDEFINED_TOKEN',
        'ANOTHER_UNDEFINED_TOKEN',
      ],
    });

    deepStrictEqual(nri.resolvedEnvVariable, undefined);
  });
});

await describe('NRIOptsBase', { concurrency: true }, async () => {
  await it('has expected props', () => {
    strictEqual(
      JSON.stringify(NRIOptionsBase.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
  await it('has expected props (In)', () => {
    strictEqual(
      JSON.stringify(NRIOptionsBase.in.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
  await it('has expected props (Out)', () => {
    strictEqual(
      JSON.stringify(NRIOptionsBase.out.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
});

await describe('NRIOpts', { concurrency: true }, async () => {
  const NRIOptionsOwn = NRIOptions.omit('project');

  await it('defaults token variables', () => {
    const options = NRIOptionsOwn.from({});
    deepStrictEqual(options.tokenEnvVars,
      Object.freeze(['NUGET_TOKEN'] as const),
    );
  });

  await it('defaults NuGet source', () => {
    const options = NRIOptionsOwn.from({});
    strictEqual(
      options.source,
      'https://api.nuget.org/v3/index.json',
    );
  });
});

await describe('when GITHUB_OUT is defined', { concurrency: true }, async () => {
  let temporary_GITHUB_OUTPUT_FileName: string;
  before(() => {
    temporary_GITHUB_OUTPUT_FileName = path.join(tmpdir(), 'HCE.Shared', 'GITHUB_OUTPUT');
    if (!existsSync(temporary_GITHUB_OUTPUT_FileName))
      writeFileSync(temporary_GITHUB_OUTPUT_FileName, 'dotnet.NRI=true');
    process.env['GITHUB_OUTPUT'] = temporary_GITHUB_OUTPUT_FileName;
  });

  await it('getGithubOutput returns non-empty object when GITHUB_OUTPUT defined and file exists', async () => {
    deepStrictEqual(await getGithubOutput(), { 'dotnet.NRI': 'true' });
  });

  await it('getGithubOutputSync returns non-empty object when GITHUB_OUTPUT defined and file exists', () => {
    deepStrictEqual(getGithubOutputSync(), { 'dotnet.NRI': 'true' });
  });
});

await describe('when GITHUB_OUTPUT file is empty...', { concurrency: true }, async () => {
  let ghOutputBak: string | undefined;
  before(() => {
    ghOutputBak = process.env['GITHUB_OUTPUT'];
    const ghOutPath = path.join(tmpdir(), 'GITHUB_OUTPUT.empty.tmp');
    if (!existsSync(ghOutPath))
      writeFileSync(ghOutPath, '', { encoding: 'utf8' });
    process.env['GITHUB_OUTPUT'] = ghOutPath;
  });

  await it('getGithubOutput returns empty object', async () => {
    deepStrictEqual(await getGithubOutput(), {});
  });

  await it('getGithubOutputSync returns empty object', () => {
    deepStrictEqual(getGithubOutputSync(), {});
  });

  after(() => {
    if (ghOutputBak)
      process.env['GITHUB_OUTPUT'] = ghOutputBak;
  });
});
