/* eslint quote-props: ["warn", "as-needed"] */
/* eslint @stylistic/quote-props: ["warn", "as-needed"] */
/* eslint @stylistic/semi: ["warn", "always"] */
import type {
  RuleConfigCondition,
  RuleConfigSeverity,
  UserConfig,
} from '@commitlint/types';
import 'tsx';

const { default: commitlintConfig } = await import('./src/commitlintConfig.ts');

const scopes = {
  CHANGELOG: 'Affects "CHANGELOG.md".',
  CIM: 'Affects "src/CaseInsensitiveMap.ts" or its tests',
  commitlint:
    'Affects "src/commitlintConfig.ts", its tests, the repo\'s commitlint config, or anything else related to commitlint.',
  deps: 'Affects dependencies required at runtime.',
  'deps-dev':
    'Affects dependencies required in the dev environment or during build time.',
  dotnet:
    'Affects "src/dotnet.ts", files in "dotnet/" or "src/dotnet/" not included in other scopes, and/or our reusable GitHub workflows provided for assisting dotnet CI.',
  'dotnet.BuildEachRID': 'Affects "dotnet/BuildEachRID.targets',
  'dotnet.END': 'Affects "dotnet/ExecNupkgDeterministicator.targets".',
  'dotnet.GHNRI':
    'Affects "src/dotnet/GithubNugetRegistryInfo.ts" or its tests.',
  'dotnet.GLNRI':
    'Affects "src/dotnet/GitlabNugetRegistryInfo.ts" or its tests.',
  'dotnet.helpers': 'Affects "src/dotnet/helpers.ts" or its tests.',
  'dotnet.INVAP':
    'Affects "src/dotnet/IsNextVersionAlreadyPublished.cli.ts" or its tests.',
  'dotnet.MSBP':
    'Affects "src/dotnet/MSBuildProject.ts" or its tests (including "tests/dotnet/MSBuildProject.projects.ts").',
  'dotnet.MSBPP':
    'Affects "src/dotnet/MSBuildProjectProperties.ts" or its tests.',
  'dotnet.NPP': 'Affects "src/dotnet/NugetProjectProperties.ts" or its tests.',
  'dotnet.NRI': 'Affects "src/dotnet/RegistryInfo.ts" or its tests.',
  'dotnet.PublishAll': 'Affects "dotnet/PublishAll.targets".',
  'dotnet.samples':
    'Affects multiple sample projects. If necessary, add a new scope for a new sample project!',
  'dotnet.samples.DN':
    'Affects the HCE.Shared.DeterministicNupkg sample project.',
  'dotnet.samples.README': 'Affects "dotnet/samples/README.md".',
  'dotnet.samples.SAP': 'Affects the SignAfterPack sample project.',
  'dotnet.SAP': 'Affects "dotnet/SignAfterPack.targets".',
  'dotnet.SemanticRelease': 'Affects "src/semanticReleaseConfigDotnet.ts" or its tests.',
  'dotnet.ZPD': 'Affects "dotnet/ZipPublishDir.targets".',
  eslint:
    'Affects "src/eslintConfig.ts", its tests, or the repo\'s ESLint config.',
  insertPlugins:
    'Affects "src/insertPlugins.ts" or its tests.',
  package: 'Affects "package.json" or its tests.',
  packemon:
    'Affects Packemon\'s configurations: "package.json#packemon", "packemon.config.ts"',
  README: 'Affects "README.md".',
  release: 'Only for release commits.',
  renovate: 'Affects "./.github/renovate.json".',
  semanticRelease: 'Affects "release.config.mjs" or "src/semanticReleaseConfig.ts" or its tests.',
  setupGitPluginSpec: 'Affects "src/setupGitPluginSpec.ts" or its tests.',
  TODO: 'Affects "TODO.md".',
  utils: 'Affects "src/utils/*" or its tests.',
  'utils.env': 'Affects "src/utils/env.ts" or its tests.',
  'utils.Exact': 'Affects "src/utils/Exact.ts" or its tests.',
  'utils.execAsync': 'Affects "src/utils/execAsync.ts" or its tests.',
  'utils.isError': 'Affects "src/utils/isError.ts or its tests.',
  'utils.GracefulRecursion': 'Affects "src/utils/GracefulRecursion.d.ts" or its tests.',
  'utils.miscTypes': 'Affects "src/utils/miscTypes.ts" or its tests.',
  'utils.reflection': 'Affects "src/utils/reflection.ts" or its tests.',
  'utils.reflection.filterForGetters': 'Affects "src/utils/reflection/filterForGetters.ts" or its tests.',
  'utils.reflection.FL': 'Affects "src/utils/reflection/FunctionLike.d.ts" or its tests.',
  'utils.reflection.GD': 'Affects "src/utils/reflection/GetterDescriptor.d.ts" or its tests.',
  'utils.reflection.getOPDs': 'Affects "src/utils/reflection/getOwnPropertyDescriptors.ts" or its tests.',
  'utils.reflection.getOPDsR': 'Affects "src/utils/reflection/getOwnPropertyDescriptorsRecursively.ts" or its tests.',
  'utils.reflection.getPrototypeOf': 'Affects "src/utils/reflection/getPrototypeOf.ts" or its tests.',
  'utils.reflection.getPrototypeChainOf': 'Affects "src/utils/reflection/getPrototypeChainOf.ts" or its tests.',
  'utils.reflection.inheritance': 'Affects "src/utils/reflection/inheritance.ts" or its tests.',
  'utils.reflection.IPDM': 'Affects "src/utils/reflection/InstancePropertyDescriptorMap.d.ts" or its tests.',
  'utils.reflection.isConstructor': 'Affects "src/utils/reflection/isConstructor.ts" or its tests.',
  'utils.reflection.isGetterDescriptor': 'Affects "src/utils/reflection/isGetterDescriptor.ts" or its tests.',
  'utils.reflection.ITOSPDM': 'Affects "src/utils/reflection/InstanceTypeOrSelfPropertyDescriptorMap.d.ts" or its tests.',
  'utils.reflection.OGDM': 'Affects "src./utils/reflection/OwnGetterDescriptorMap.d.ts" or its tests.',
  'utils.reflection.OPDM': 'Affects "src/utils/reflection/OwnPropertyDescriptorMap.d.ts" or its tests.',
  'utils.reflection.OwnKeyOf': 'Affects "src/utils/reflection/OwnKeyOf.d.ts" or its tests.',
  'utils.reflection.PDM': 'Affects "src/utils/reflection/PropertyDescriptorMap.d.ts" or its tests.',
  vscode: 'Affects ".vscode/".',
} as const;

const config: UserConfig = {
  ...(commitlintConfig satisfies UserConfig),
  rules: {
    ...commitlintConfig.rules,
    'scope-enum': [
      2 as RuleConfigSeverity.Error,
      'always' as RuleConfigCondition,
      Object.keys(scopes) satisfies string[] as (keyof typeof scopes)[],
    ],
  },
};

export default config;
