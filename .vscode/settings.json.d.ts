interface Settings {
  '[json]': { 'files.insertFinalNewline': true }
  '[jsonc]': { 'files.insertFinalNewline': true }
  'auto-close-tag.disableOnLanguage': ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']
  'cSpell.words': [
    'arktype',
    'conventionalcommits',
    'determinize',
    'GHNRI',
    'GHPR',
    'GLNRI',
    'globbed',
    'GLPR',
    'halospv3',
    'nameof',
    'packemon',
    'polyrepo',
    'tseslint',
    'tsout',
  ]
  'editor.quickSuggestions': { strings: 'on' }
  'files.readonlyInclude': { '_tsout/**': true, 'node_modules/**': true, 'cjs/**': true, 'mjs/**': true }
  'nodejs-testing.include': ['./', './tests/', './tests/dotnet/', './tests/package.test.ts']
  'nodejs-testing.extensions': [{ extensions: ['mts', 'cts', 'ts'], parameters: ['--import', 'tsx'] }]
  'prettier.configPath': 'prettier.config.js'
  'typescript.implementationsCodeLens.enabled': true
  'typescript.tsdk': 'node_modules\\typescript\\lib'
  'yaml.format.singleQuote': true
  'eslint.probe': [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'html',
    'vue',
    'markdown',
    'json',
    'jsonc',
    'json5',
  ]
  'eslint.useFlatConfig': true
  'eslint.useESLintClass': true
  'eslint.validate': [
    'javascript',
    'javascriptreact',
    'json',
    'jsonc',
    'json5',
    'typescript',
    'typescriptreact',
  ]
  'typescript.tsserver.experimental.enableProjectDiagnostics': true
  'typescript.tsserver.web.projectWideIntellisense.enabled': true
  'git.allowNoVerifyCommit': true
  'markiscodecoverage.enableDecorations': true
  'sarif-viewer.connectToGithubCodeScanning': 'off'
  'conventionalCommits.scopes': [
    'commitlintConfig',
    'deps-dev',
    'deps',
    'dotnet.ExecNupkgDeterministicator',
    'dotnet.samples.HCE.Shared.DeterministicNupkg',
    'dotnet.samples.HCE.Shared.SignAfterPack',
    'dotnet.SignAfterPack',
    'dotnet',
    'packemon',
    'utils.execAsync',
    'utils.miscTypes',
    'utils.reflection',
    'utils',
    'vscode',
  ]
  'gitCommitMessageEditor.intelliSense.completion.scopes': [
    {
      scope: 'commitlintConfig'
      description: 'Affects "src/commitlintConfig.ts" or its tests.'
    },
    {
      scope: 'deps-dev'
      description: 'Affects dependencies required in the dev environment or during build time.'
    },
    { scope: 'deps', description: 'Affects dependencies required at runtime.' },
    {
      scope: 'dotnet.helpers'
      description: 'Affects "src/dotnet/helpers.ts" or its tests.'
    },
    {
      scope: 'dotnet.END'
      description: 'Affects "dotnet/ExecNupkgDeterministicator.targets".'
    },
    {
      scope: 'dotnet.MSBP'
      description: 'Affects "src/dotnet/MSBuildProject.ts" or its tests (including "tests/dotnet/MSBuildProject.projects.ts").'
    },
    {
      scope: 'dotnet.samples.DN'
      description: 'Affects the HCE.Shared.DeterministicNupkg sample project.'
    },
    {
      scope: 'dotnet.samples.SAP'
      description: 'Affects the SignAfterPack sample project.'
    },
    {
      scope: 'dotnet.SAP'
      description: 'Affects "dotnet/SignAfterPack.targets" or its tests.'
    },
    {
      scope: 'dotnet'
      description: 'Affects files in "dotnet/" or "src/dotnet/" not included in other scopes -OR- affects our generic GitHub reusable workflows provided for assisting dotnet CI.'
    },
    {
      scope: 'packemon'
      description: 'Affects Packemon\'s configurations: "package.json#packemon", "packemon.config.ts"'
    },
    {
      scope: 'utils.execAsync'
      description: 'Affects "src/utils/execAsync.ts" or its tests.'
    },
    {
      scope: 'utils.miscTypes'
      description: 'Affects "src/utils/miscTypes.ts" or its tests.'
    },
    {
      scope: 'utils.reflection'
      description: 'Affects "src/utils/reflection.ts" or its tests.'
    },
    { scope: 'utils', description: 'Affects "src/utils/*" or its tests.' },
    { scope: 'vscode', description: 'Affects ".vscode/".' },
  ]
}

declare const Settings: Settings

export = Settings
