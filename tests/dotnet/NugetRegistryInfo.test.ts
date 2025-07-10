import {
  deepStrictEqual,
  strictEqual,
} from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  NugetRegistryInfo as NRI,
  NRIOpts,
  NRIOptsBase,
  getGithubOutput,
  getGithubOutputSync,
} from '../../src/dotnet/NugetRegistryInfo.js';
import { isConstructor } from '../../src/utils/reflection.js';

await describe('NugetRegistryInfo', async () => {
  await it('is a class', () => {
    deepStrictEqual(isConstructor(NRI), true);
  });
});

await describe('InstanceOf NugetRegistryInfo', async () => {
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js');

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
    // eslint-disable-next-line unicorn/no-useless-undefined
    deepStrictEqual(nri.resolvedEnvVariable, undefined);
  });
});

await describe('NRIOptsBase', async () => {
  await it('has expected props', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.props, undefined, 2),
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
      JSON.stringify(NRIOptsBase.in.props, undefined, 2),
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
      JSON.stringify(NRIOptsBase.out.props, undefined, 2),
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

await describe('NRIOpts', async () => {
  const NRIOptsOwn = NRIOpts.omit('project');

  await it('defaults token variables', () => {
    const opts = NRIOptsOwn.from({});
    deepStrictEqual(opts.tokenEnvVars,
      Object.freeze(['NUGET_TOKEN'] as const),
    );
  });

  await it('defaults NuGet source', () => {
    const opts = NRIOptsOwn.from({});
    strictEqual(
      opts.source,
      'https://api.nuget.org/v3/index.json',
    );
  });
});

await describe('getGithubOutput', async () => {
  await it('returns empty object when GITHUB_OUTPUT is undefined', async () => {
    const ghOutputBak = process.env['GITHUB_OUTPUT'];
    process.env['GITHUB_OUTPUT'] = undefined;
    try {
      deepStrictEqual(await getGithubOutput(), {});
    }
    finally {
      process.env['GITHUB_OUTPUT'] = ghOutputBak;
    }
  }).then(async () => {
    await it('returns non-empty object when GITHUB_OUTPUT defined and file exists', async () => {
      const tmp_GITHUB_OUTPUT_FileName = path.join(tmpdir(), 'HCE.Shared', 'GITHUB_OUTPUT');
      if (!existsSync(tmp_GITHUB_OUTPUT_FileName))
        writeFileSync(tmp_GITHUB_OUTPUT_FileName, 'dotnet.NRI=true');
      process.env['GITHUB_OUTPUT'] = tmp_GITHUB_OUTPUT_FileName;

      const ghOutput = await getGithubOutput();
      deepStrictEqual(ghOutput, { 'dotnet.NRI': 'true' });
    });
  });
});

await describe('getGithubOutputSync', async () => {
  await it('returns empty object when GITHUB_OUTPUT is undefined', () => {
    const ghOutputBak = process.env['GITHUB_OUTPUT'];
    process.env['GITHUB_OUTPUT'] = undefined;
    try {
      deepStrictEqual(getGithubOutputSync(), {});
    }
    finally {
      process.env['GITHUB_OUTPUT'] = ghOutputBak;
    }
  }).then(async () => {
    await it('returns non-empty object when GITHUB_OUTPUT defined and file exists', () => {
      const tmp_GITHUB_OUTPUT_FileName = path.join(tmpdir(), 'HCE.Shared', 'GITHUB_OUTPUT');
      if (!existsSync(tmp_GITHUB_OUTPUT_FileName))
        writeFileSync(tmp_GITHUB_OUTPUT_FileName, 'dotnet.NRI=true');
      process.env['GITHUB_OUTPUT'] = tmp_GITHUB_OUTPUT_FileName;

      const ghOutput = getGithubOutputSync();
      deepStrictEqual(ghOutput, { 'dotnet.NRI': 'true' });
    });
  });
});
