## [3.0.0](https://github.com/HaloSPV3/HCE.Shared/compare/v2.6.6...v3.0.0) (2025-10-21)

### ⚠ BREAKING CHANGES

* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec`
* manually set package version to 3.0.0
* **deps, deps-dev:** bump `commitlint` deps to ^19.8.1; move `@commitlint/types` to dev deps
* deeply const `semanticReleaseConfig` `baseConfig` to expose values in type, but export as deeply mutable
* bump @semantic-release/github to v11.0.1
* **semanticRelease:** change semanticReleaseConfig's baseConfig to const; add more type
* **semanticRelease:** change type of defaultPlugins to frozen "as const" string array
* **dotnet.helpers:** overhaul `dotnetHelpers`
* **dotnet:** allow readonly array args where they are not modified
* **dotnet:** pass each path in `string[]` `projectsToPublish` to `Evaluate`; allow passing `MSBP[]`, `NRI[]` to `configurePrepareCmd`
* **dotnet.NRI:** add `NugetRegistryInfo`  arg/prop `project`; refactor `isTokenDefined`; add `DefaultTokenEnvVars`
* **dotnet:** move `NugetRegistryPair`, `nugetDefault` to its own file
* **dotnet.MSBP:** add MSBuildProject.Evaluate
* **dotnet:** refactor MSBuildProject
* **dotnet.NPP:** remove InstanceProperties GetUniquePropertyKeys; change readonly fields to getters; ensure types
* **dotnet:** change read-only fields to getters.
* **dotnet:** replace MSBuildProjectProperties constructor arg 'rest' with 'properties'
* **dotnet:** rename MSBuildProjectProperties.FullName to MSBuildProjectFullPath
* remove param "exists" from MSBuildProjectProperties ctor
* remove property PredefinedProperties
* remove default export 'getConfig'
* remove appendPlugins
* rewrite semanticReleaseConfigDotnet as class
* rewrite dotnetGHPR, dotnetGLPR, NuGetRegistryInfo as classes
* move MSBuildProjectProperties to MSBuildProject.ts
* remove 'dotnet' facade
* increase TypeScript target from ES5 to ES2022
* CJS is no longer supported
* remove static semantic-release config

### Features

* add `ProjectsToPublish`, `ProjectsToPackAndPush`, `EvaluatedProjects` to `SemanticReleaseConfigDotnet` ([bd37885](https://github.com/HaloSPV3/HCE.Shared/commit/bd37885b58c5ed47a33b934d751106bfb7c04315))
* **CIM:** add CaseInsensitiveMap ([d6beb2a](https://github.com/HaloSPV3/HCE.Shared/commit/d6beb2afe4eb9660059618e1c061e81465eea950))
* **dotnet, dotnet.NRI:** add `PackDummyPackage`; add `tmpDirNamespace`, `getDummiesDir` ([6023a4e](https://github.com/HaloSPV3/HCE.Shared/commit/6023a4ef238f2650ccc7f53f91549c5a57f60442))
* **dotnet.GHNRI:** add `DefaultGithubTokenEnvVars`; update constructor args to satisfy NRI changes ([3bbcbf1](https://github.com/HaloSPV3/HCE.Shared/commit/3bbcbf180fb01ed2d2a7bea3b2605925d41850bf))
* **dotnet.INVAP, dotnet.NRI:** add `GetIsNextVersionAlreadyPublishedCommand`, `getGithubOutput`, `getGithubOutputSync`, script for deferred execution of `IsNextVersionAlreadyPublished` ([970acb3](https://github.com/HaloSPV3/HCE.Shared/commit/970acb34ded0db20d5fa692f8e731ccce7bc1d61))
* **dotnet.MSBP, dotnet.NPP, dotnet.SemanticRelease:** replace `GetNPPGetterNames` with `NPPGetterNames` ([38ea89d](https://github.com/HaloSPV3/HCE.Shared/commit/38ea89df2a23a01c67bb983559fa08e7d9901230))
* **dotnet.MSBP, dotnet.NRI, utils.execAsync:** add `execAsync` wrapper; sort imports ([ca85fa2](https://github.com/HaloSPV3/HCE.Shared/commit/ca85fa2b1a8b08760a8a09171e22e9fab06468f6))
* **dotnet.MSBP:** add `BaseOutputPath`, `OutDir` ([daf1c40](https://github.com/HaloSPV3/HCE.Shared/commit/daf1c4029c1a542dda2de3fdd6fc19bca8abae7d))
* **dotnet.MSBP:** add MSBuildProject.Evaluate ([cbcf06b](https://github.com/HaloSPV3/HCE.Shared/commit/cbcf06bb2d6339a37cf9b5dc86463b974df82461))
* **dotnet.MSBP:** add optional 'projTargets'  arguments to `Evaluate` ([9bd1328](https://github.com/HaloSPV3/HCE.Shared/commit/9bd132805a1f1114b8ce4a03bf688d391c98a00b))
* **dotnet.MSBP:** add static method `MSBP.fromJSON` ([77f3d71](https://github.com/HaloSPV3/HCE.Shared/commit/77f3d71546143736c0486c2bd4134956a1fa20a6))
* **dotnet.MSBP:** export MSBuildEvaluationOutput, some internal ArkType types ([a083f5a](https://github.com/HaloSPV3/HCE.Shared/commit/a083f5a8469b528994fc1cb29be34365076aac26))
* **dotnet.MSBP:** expose `EvaluationOptions`, `EvaluationOptions.t` ([f1083c3](https://github.com/HaloSPV3/HCE.Shared/commit/f1083c3eeebe41fd060b260daa20fcea220d1724))
* **dotnet.MSBPP:** add `BaseIntermediateOutputPath`, `IntermediateOutputPath` ([e5b6d19](https://github.com/HaloSPV3/HCE.Shared/commit/e5b6d19548be494bcf5ce0514598ce96060ae7af))
* **dotnet.MSBPP:** copy and expose protected method `getAndForget` to type system ([cf05ca7](https://github.com/HaloSPV3/HCE.Shared/commit/cf05ca7b8bf69bcf4b7f1a654d75dbdb32bdaddd))
* **dotnet.MSBPP:** export type `Class_MSBPP` for convenience ([88878bc](https://github.com/HaloSPV3/HCE.Shared/commit/88878bc3157fc7bec4404a48f9b316f2aed33ef5))
* **dotnet.NPP:** add `GetNPPGetterNames` with result caching ([5e82143](https://github.com/HaloSPV3/HCE.Shared/commit/5e82143c37fc4ac6c054e346e15d9fb6da341258))
* **dotnet.NPP:** add NugetProjectProperties ([a5bd9d5](https://github.com/HaloSPV3/HCE.Shared/commit/a5bd9d518968ee70f01b6281b82d8ed877672d75))
* **dotnet.NPP:** export `ClassLike` type `Class_NPP` for convenience ([8a3618e](https://github.com/HaloSPV3/HCE.Shared/commit/8a3618ebf051b135b94923e731e6eef4c41e9780))
* **dotnet.NRI:** add `GetNameForURL` ([5f635d9](https://github.com/HaloSPV3/HCE.Shared/commit/5f635d9066543650f0a0b5ca3a8ad64fd5c6adb9))
* **dotnet.NRI:** add `GetPushDummyPackageCommand` ([00bb9f7](https://github.com/HaloSPV3/HCE.Shared/commit/00bb9f7686350423a756c8cd056555c2dd73d58b))
* **dotnet.NRI:** add `NugetRegistryInfo`  arg/prop `project`; refactor `isTokenDefined`; add `DefaultTokenEnvVars` ([500a86a](https://github.com/HaloSPV3/HCE.Shared/commit/500a86aefc953198fc0e43f3e9e150195e578dc2))
* **dotnet.NRI:** add `NugetRegistryInfoOptionsBase`, `NugetRegistryInfoOptions` ([f79de04](https://github.com/HaloSPV3/HCE.Shared/commit/f79de0425305d40150e304c512b740a8a8817f4b))
* **dotnet.NRI:** add `PackPackagesOptionsType`, `GetPackCommand`; add `opts` param to `PackDummyPackage` ([e1f3a46](https://github.com/HaloSPV3/HCE.Shared/commit/e1f3a4686dc937833392cfaa09ad545b4133485d))
* **dotnet.NRI:** add `PushPackagesOptionsType`, `GetPushCommand`, private `PushPackages` ([df7b9b3](https://github.com/HaloSPV3/HCE.Shared/commit/df7b9b30991448b7279f115577ffcfa92b1cd084))
* **dotnet.NRI:** add types `NRI.PackDummyPackagesOptionsType`, `NRI.PushDummyPackagesOptionsType ([d9a53a8](https://github.com/HaloSPV3/HCE.Shared/commit/d9a53a8d7e6936472f92bc20dc2305d7cb6cbf8c))
* **dotnet.SAP:** add target `SignAfterPack` ([ad1584f](https://github.com/HaloSPV3/HCE.Shared/commit/ad1584f6d3244dfc784da93731f76fc099e936f9))
* **dotnet.SemanticRelease:** add method `getTokenTestingCommands` ([330724e](https://github.com/HaloSPV3/HCE.Shared/commit/330724e58c7f2932bb109e18bfba9402e9ca45e1))
* **dotnet.SemanticRelease:** add method `splicePlugin` ([5c6963a](https://github.com/HaloSPV3/HCE.Shared/commit/5c6963a66f73ec97ec246892750988fa83001254))
* **dotnet:** add `NugetRegistryPair.fromNugetRegistryInfoAsync` ([f5844ff](https://github.com/HaloSPV3/HCE.Shared/commit/f5844ffe4545fdfe525817e1aac55736b2a153a7))
* **dotnet:** add MSBuildProjectProperties.GetFullPath ([360e317](https://github.com/HaloSPV3/HCE.Shared/commit/360e317951017f6024f53dd54d46dfd20759606a))
* **dotnet:** add MSBuildProjectProperties.OutputPath ([de8d90c](https://github.com/HaloSPV3/HCE.Shared/commit/de8d90c9ec1faf6b5fd78b41bf867e8274ea476d))
* **dotnet:** refactor MSBuildProject ([d743877](https://github.com/HaloSPV3/HCE.Shared/commit/d743877ea10d8fcaa55517faa22db4dbf968a6ab))
* enable adding release links to bottom of GitHub releases ([bc20d5e](https://github.com/HaloSPV3/HCE.Shared/commit/bc20d5e2a73395e14bcdd2b51538c57a29097c98))
* **eslint:** export config array separately from default export ([14b7f11](https://github.com/HaloSPV3/HCE.Shared/commit/14b7f11b17479dd4d03625fc0902d01fe6c60b84))
* export `@semantic-release/exec` `Options` interface ([331456e](https://github.com/HaloSPV3/HCE.Shared/commit/331456ed9ffe220f0270a1aefc3b34973c5ce64b))
* **insertPlugins:** add, export `insertPlugin`; declare internal `insertAndSortPlugins`; fix false-positive error caused by `!0` ([8971599](https://github.com/HaloSPV3/HCE.Shared/commit/8971599585dc962d5be6e7c3cc084f8c1a65d71c))
* **semanticRelease:** add PluginSpec<P,T> and derived types for binding a plugin to its Options ([00e50a0](https://github.com/HaloSPV3/HCE.Shared/commit/00e50a0b912ea2b8a315192823df1a841484a9c7))
* **utils.env:** enable passing options `loadDotenv` options to `getEnvVarValue` ([69b348c](https://github.com/HaloSPV3/HCE.Shared/commit/69b348cddd899d56d951a988e581a3d98cf33aec))
* **utils.Exact:** export `Exact<T, S>` ([65db38a](https://github.com/HaloSPV3/HCE.Shared/commit/65db38a0eb9cae858b1aa3c67c478de27a6160eb))
* **utils.execAsync:** add `ChildProcessSpawnException` for `execAsync` wrapper ([a1f032e](https://github.com/HaloSPV3/HCE.Shared/commit/a1f032ec92498e930074f0a88e883725c85a406a))
* **utils.GracefulRecursion:** export GracefulRecursion types `Length<T>`, `TupleOf<N, T>`, `Pop<T>`, `Increment<N>`, `Decrement` ([dacf0b5](https://github.com/HaloSPV3/HCE.Shared/commit/dacf0b5192d30ce5ea9a012806960db603fec88a))
* **utils.reflection.FL:** add type FunctionLike ([d236ee1](https://github.com/HaloSPV3/HCE.Shared/commit/d236ee1fb86a109a964c3b025da117f49468c30b))
* **utils.reflection.GD:** add type `GetterDescriptor` ([7d0333c](https://github.com/HaloSPV3/HCE.Shared/commit/7d0333cf3a7d10faee98dc550c231db2a3784e8d))
* **utils.reflection.getOPDs:** move `getOwnPropertyDescriptors` to its own file ([e860edd](https://github.com/HaloSPV3/HCE.Shared/commit/e860eddccaea975cd115caec4ecf89ac6946e0e6))
* **utils.reflection.getOPDsR:** move `getOwnPropertyDescriptorsRecursively` and related types to their own file ([2cc8c04](https://github.com/HaloSPV3/HCE.Shared/commit/2cc8c042de200702e95129f357c167cf628d2fe8))
* **utils.reflection.getPrototypeChainOf:** add function `getPrototypeChainOf` ([acf5d59](https://github.com/HaloSPV3/HCE.Shared/commit/acf5d593c0cc6008af1a02d3ddd4777958cd6fef))
* **utils.reflection.inheritance, utils.reflection.getPrototypeOf:** add inheritance group ([9403382](https://github.com/HaloSPV3/HCE.Shared/commit/94033822f8469ec1697b06ed98f7e909f7616b28))
* **utils.reflection.IPDM:** add type `InstancePropertyDescriptorMap` ([d3e8f61](https://github.com/HaloSPV3/HCE.Shared/commit/d3e8f6177958927b5e7cbe80c8c91a77e44792ba))
* **utils.reflection.isConstructor:** add function `isConstructor` ([e6e551b](https://github.com/HaloSPV3/HCE.Shared/commit/e6e551bcb516f99fdb72a4613b8433f46bb0c626))
* **utils.reflection.isGetterDescriptor:** add `isGetterDescriptor` ([c42a202](https://github.com/HaloSPV3/HCE.Shared/commit/c42a202249693ced46534fdad37aa3a90d933d25))
* **utils.reflection.ITOSPDM:** add type `InstanceTypeOrSelfPropertyDescriptorMap` ([45e1030](https://github.com/HaloSPV3/HCE.Shared/commit/45e10305db683910cad0f6021d09fab70792e327))
* **utils.reflection.OGDM:** add type `OwnGetterDescriptorMap` ([2b136f6](https://github.com/HaloSPV3/HCE.Shared/commit/2b136f68220147f9102490ca61f25917d10ab3f3))
* **utils.reflection.OPDM:** add type `OwnPropertyDescriptorMap` ([15605d4](https://github.com/HaloSPV3/HCE.Shared/commit/15605d47937a813e99da5f1821d2cde589078b7e))
* **utils.reflection.OwnKeyOf:** export utility type `OwnKeyOf<T, __proto__>` ([ef0f609](https://github.com/HaloSPV3/HCE.Shared/commit/ef0f609ab2b7ef8a11ba94b83ca4811c50328018))
* **utils.reflection.PDM:** add PropertyDescriptorMap variant with extra type parameter for Omit ([9318a0e](https://github.com/HaloSPV3/HCE.Shared/commit/9318a0ebe1251f93faa1728c21b4e69105137b86))
* **utils.reflection:** move `listOwnGetters` to its own file ([f6976f5](https://github.com/HaloSPV3/HCE.Shared/commit/f6976f597d4f59666499f33135621849a7224a5b))
* **utils:** add miscTypes.ts ([11cefed](https://github.com/HaloSPV3/HCE.Shared/commit/11cefed5e884df9eac187490d6445f2dcffb2d41))
* **utils:** add reflection.ts ([6fb70d8](https://github.com/HaloSPV3/HCE.Shared/commit/6fb70d8e4b627b50f8b8a8d972a504d843f0ad3e))

### Bug Fixes

* avoid using implicitly fixed-length arrays ([02a2c2b](https://github.com/HaloSPV3/HCE.Shared/commit/02a2c2b880025fbd5e309d330f5546c6101ce3c0))
* **deps, deps-dev:** bump `commitlint` deps to ^19.8.1; move `@commitlint/types` to dev deps ([7b3eccd](https://github.com/HaloSPV3/HCE.Shared/commit/7b3eccdefe8539ede9f9381e6476e35e704aef63))
* **deps, deps-dev:** update `@eslint/js`, `eslint` to v9.31.0 ([a3fe6e9](https://github.com/HaloSPV3/HCE.Shared/commit/a3fe6e9bb078bf5bab11008a44133e0108ec6614))
* **deps, deps-dev:** upgrade `eslint` deps ([c50fdb8](https://github.com/HaloSPV3/HCE.Shared/commit/c50fdb8b68464d0b288c37f6716d2eef744d6b57))
* **deps:** :ambulance: bump ws to 8.18.0 (>=8.17.1) ([97c20f8](https://github.com/HaloSPV3/HCE.Shared/commit/97c20f804e1f255fba4eb9e6222de3d5d4ebbca7))
* **deps:** 🚑️ bump micromatch to v4.0.8 ([24676f1](https://github.com/HaloSPV3/HCE.Shared/commit/24676f1b9b582029fadc29214b3e4bcd7c1e82ce))
* **deps:** bump  `@types/node` to Node.js 20.11.x ([1a0ea53](https://github.com/HaloSPV3/HCE.Shared/commit/1a0ea5391f2b1c29445262852797b448acd81e8f))
* **deps:** bump @types/node to v22.9.0 ([b5ca498](https://github.com/HaloSPV3/HCE.Shared/commit/b5ca49820d592ec78e14d8fea7b401ae07ef9da0))
* **deps:** bump `@types/node` to 22.15.34 ([918af5e](https://github.com/HaloSPV3/HCE.Shared/commit/918af5ee8c23f653f784b42a850c066871b81a6a))
* **deps:** bump `arktype` to 2.1.20 ([5c8c17a](https://github.com/HaloSPV3/HCE.Shared/commit/5c8c17a82448bfb7d05d37c3ac86b0c4b012cbb4))
* **deps:** bump `chardet` to ^2.1.0 ([997c286](https://github.com/HaloSPV3/HCE.Shared/commit/997c286f5f7a79a5484eb1c961d6ebe247a3cf5a))
* **deps:** bump `conventional-changelog-conventionalcommits` to ^9.0.0 ([1d18454](https://github.com/HaloSPV3/HCE.Shared/commit/1d184547e35c2d3294c9f5a0b90174491b116069))
* **deps:** bump `debug` to ^4.4.1 ([33bc96b](https://github.com/HaloSPV3/HCE.Shared/commit/33bc96b1932cbba95ee33f9cd12aaf7d3358cc44))
* **deps:** bump `globals` to ^16.2.0 ([069801c](https://github.com/HaloSPV3/HCE.Shared/commit/069801cce11cc167cb5536c2f3cb5d6ae51b424b))
* **deps:** bump `globals` to 16.3.0 ([6c4f22f](https://github.com/HaloSPV3/HCE.Shared/commit/6c4f22f9c0636786246b2d685259fe79190d9b04))
* **deps:** bump `husky` to ^9.1.7 ([9aa7c29](https://github.com/HaloSPV3/HCE.Shared/commit/9aa7c2997ae1a5d0a95835a57334f469f1788458))
* **deps:** bump `import-meta-resolve` to 4.1.0 ([c80930a](https://github.com/HaloSPV3/HCE.Shared/commit/c80930a7cc4b95ea77bbeea0808df73c43793aa8))
* **deps:** bump `semantic-release-export-data` to ^1.1.0 ([824c790](https://github.com/HaloSPV3/HCE.Shared/commit/824c7907e1c757b1ba35cc479844ae61db26d26f))
* **deps:** bump `semantic-release` to 24.2.6 ([9f24a9e](https://github.com/HaloSPV3/HCE.Shared/commit/9f24a9ef6564281c245a4e0a0f5f10212c2e586b))
* **deps:** bump `ts-essentials` to ^10.1.1 ([9032d15](https://github.com/HaloSPV3/HCE.Shared/commit/9032d15780a6cb3801e6a128ebb3318d5b2c3327))
* **deps:** bump `typescript-eslint` to ^8.34.0; remove redundant deps ([3e6d341](https://github.com/HaloSPV3/HCE.Shared/commit/3e6d34172d2f1f6886c9d560913d76661f5c1571))
* **deps:** bump arktype from 2.0.0-rc.17 to 2.0.0-rc.21 ([54671dd](https://github.com/HaloSPV3/HCE.Shared/commit/54671ddfb3606b50967871474bd56a8433fb9156))
* **deps:** bump arktype from 2.0.0-rc.6 to 2.0.0-rc.17 ([76a02b2](https://github.com/HaloSPV3/HCE.Shared/commit/76a02b2433e0eaec9fa3c7eca7251fa7ec191478))
* **deps:** bump arktypes from v2.0.0-beta.2 to v2.0.0-rc.6 ([ae77ccd](https://github.com/HaloSPV3/HCE.Shared/commit/ae77ccdff113e41f5360fd6679d82a9ac6f31207))
* **deps:** bump eslint-plugin-jsonc to v2.17.0 ([383317a](https://github.com/HaloSPV3/HCE.Shared/commit/383317a51cba11e28bcf868cb3eeef11fae0bf22))
* **deps:** bump group typescript-eslint to v8.13.0 ([e0f1e98](https://github.com/HaloSPV3/HCE.Shared/commit/e0f1e98219e5495d59bb59515f6764162d1e8893))
* **deps:** force `semantic-release-export-data` to use `@actions/core@1.11.1` to mitigate CVE-2025-22150 ([1b9cd9c](https://github.com/HaloSPV3/HCE.Shared/commit/1b9cd9c34f34b656f135ed9cd128366168df97b4))
* **deps:** remove deprecated `@types/semantic-release` ([57536e0](https://github.com/HaloSPV3/HCE.Shared/commit/57536e05789faedb2b3ced40a44b91bee5c14349))
* **deps:** remove unused dep `@octokit/request` ([8d5feba](https://github.com/HaloSPV3/HCE.Shared/commit/8d5feba29a706a4c42e0b09ab7aa3e99d5c39e34))
* **deps:** replace `dotenv` with `@dotenvx/dotenvx`; move to runtime deps ([76b32b8](https://github.com/HaloSPV3/HCE.Shared/commit/76b32b8be7a911d0938b8086bc51d1c685511c34))
* **deps:** set `@types/node` semver range to PATCHes ([91395dd](https://github.com/HaloSPV3/HCE.Shared/commit/91395dd2408752b536c91887cc6092f0c3b0b929))
* **deps:** update @eslint/plugin-kit to v0.2.3; update cross-spawn to v7.0.6 ([715ddf9](https://github.com/HaloSPV3/HCE.Shared/commit/715ddf9dd10fa1a672578f77fe4acc4a95584de4))
* **deps:** update `@dotenvx/dotenvx` to v1.47.6 ([a52fd9c](https://github.com/HaloSPV3/HCE.Shared/commit/a52fd9c0719024ef00cd836dbc654c4552cea3eb))
* **deps:** update `conventional-changelog-conventionalcommits` to v9.1.0 ([43cb289](https://github.com/HaloSPV3/HCE.Shared/commit/43cb2895345996220ec328686d0a2aa3e1f63a04))
* **deps:** update `semantic-release` to v24.2.7 ([5ed024b](https://github.com/HaloSPV3/HCE.Shared/commit/5ed024b8eac1db8de08ff7b0b7a6d3d8cc49900d))
* **deps:** update `typescript-eslint` to v8.37.0 ([7bb7852](https://github.com/HaloSPV3/HCE.Shared/commit/7bb78527922020b6a07302a905c4f58459bd8186))
* **deps:** update commitlint monorepo to v20 ([247558f](https://github.com/HaloSPV3/HCE.Shared/commit/247558f50593020cee13dc75e06647f36204eacc))
* **deps:** update npm to v10.9.1 ([cd3b17f](https://github.com/HaloSPV3/HCE.Shared/commit/cd3b17fd6cf58adbf5e103d76f5b386d417dc0d3))
* **deps:** update semantic-release monorepo ([3c87c63](https://github.com/HaloSPV3/HCE.Shared/commit/3c87c638ed7784f41eb12f6dc3246675096e242e))
* **deps:** upgrade `@babel/runtime`, `brace-expansion`, `undici` to mitigate CVEs ([b9d0cb2](https://github.com/HaloSPV3/HCE.Shared/commit/b9d0cb27892f855d63a839db49869275f8cce6c4))
* **deps:** upgrade `@stylistic/eslint-plugin` to ^5.0.0 ([cb44505](https://github.com/HaloSPV3/HCE.Shared/commit/cb44505e65b888c110541e3612a85cbaec3ba068))
* **deps:** upgrade `semantic-release` and its plugins ([6c2e4a5](https://github.com/HaloSPV3/HCE.Shared/commit/6c2e4a5cfc44963b3a66e1f87584ed9561f0a9eb))
* **deps:** upgrade group "eslint" ([c1c3b5f](https://github.com/HaloSPV3/HCE.Shared/commit/c1c3b5fd784f567312bfa26792edfb46936e1317))
* disable `@semantic-release/npm` tarballDir config ([b4d2fb5](https://github.com/HaloSPV3/HCE.Shared/commit/b4d2fb50b368e5c66c323781fb094adee7f8fb01))
* don't forget to add the GHTuple object to the plugins list, overwriting the original GHTuple ([4b8e8a3](https://github.com/HaloSPV3/HCE.Shared/commit/4b8e8a3ec7215aa75785793006e6f0cd4a76ae60))
* **dotnet, dotnet.PublishAll:** append `-p:Configuration=Release` to PublishAll commands ([3ebe7be](https://github.com/HaloSPV3/HCE.Shared/commit/3ebe7be14568f60005a894b465352b7c65cea00e))
* **dotnet.INVAP:** assign arg values to real props in `options` ([4af543d](https://github.com/HaloSPV3/HCE.Shared/commit/4af543d4f2d27cbff4a32ba464d94c1cb01aa302))
* **dotnet.INVAP:** execute INVAP cli only if it's the main module ([5006ab1](https://github.com/HaloSPV3/HCE.Shared/commit/5006ab1d6ff46554f5fd17d076465fcc1e2018e6)), closes [#455](https://github.com/HaloSPV3/HCE.Shared/issues/455)
* **dotnet.SemanticRelease:** append `@semantic-release/exec` plugin to plugins array if not found ([7eeafb2](https://github.com/HaloSPV3/HCE.Shared/commit/7eeafb2caab31358ecb91f8b3f1b885a11bc43b8))
* **dotnet.SemanticRelease:** do not `await string[]` ([f56cc94](https://github.com/HaloSPV3/HCE.Shared/commit/f56cc949dbec7ac9953b3d0a90de1db7c43db2b3))
* **dotnet.SemanticRelease:** set/append dummy pack, dummy push, and INVAP commands ([88a523e](https://github.com/HaloSPV3/HCE.Shared/commit/88a523e231a821b59b72af0dee785affa9889499))
* **dotnet.SemanticRelease:** swap out `console.debug` with colorful `debug` logging ([54029e1](https://github.com/HaloSPV3/HCE.Shared/commit/54029e1089e802ed6dcc02338b67118a67f7ecb4))
* **dotnet.ZPD:** beware of case-insensitive property names! Prefix private props with '_'; fix invalid condition expressions; add conditions to assignments ([60a25ce](https://github.com/HaloSPV3/HCE.Shared/commit/60a25ce54202e31003491e32016e47dd990acd4e))
* **dotnet.ZPD:** fix placeholders PropertyGroup condition almost always evaluating to `true` ([44f2fc4](https://github.com/HaloSPV3/HCE.Shared/commit/44f2fc4af1caf3d14c4fe27ba27154d79094a7a3))
* **dotnet:** do not mix `export *` and `export type *`! ([1184896](https://github.com/HaloSPV3/HCE.Shared/commit/118489616924fdb3d62670a67b1a0ab8123ba299))
* **dotnet:** do not mix `export *` and `export type *`! ([859dfb4](https://github.com/HaloSPV3/HCE.Shared/commit/859dfb440b32258ddd34f36cb9f42f033b8b287a))
* **dotnet:** fix `-t:Publish` commands starting with `dotnet publish` instead of `dotnet msbuild` ([5d6bbca](https://github.com/HaloSPV3/HCE.Shared/commit/5d6bbca822131eeb2c76e184e6b4c036e161cc15))
* **dotnet:** fix PublishAll never running `_PublishProjectForAllFrameworksAndRuntimes` ([1717ea6](https://github.com/HaloSPV3/HCE.Shared/commit/1717ea6ac6256dcba00a61a62f0d270f0267a54d))
* fix apparently case-sensitive repo url for attestation/provenance ([19e1d72](https://github.com/HaloSPV3/HCE.Shared/commit/19e1d721eaf6a3137aa721ad80200f28b58a3134))
* fix typo in $ghRegistry string ([8f8de0d](https://github.com/HaloSPV3/HCE.Shared/commit/8f8de0d5a23403f11824c839dc80a98025f06b04))
* move gitlab `git push --tags` to `publish` step ([5faf150](https://github.com/HaloSPV3/HCE.Shared/commit/5faf1509f8176fd530c1041ee3384b3554ca1369))
* remove second gitlab-sync ([b09f6c9](https://github.com/HaloSPV3/HCE.Shared/commit/b09f6c937a295d5bedcff85e8e32a4770b369ff2))
* replace `debug.log` calls with `debug` call ([1b94603](https://github.com/HaloSPV3/HCE.Shared/commit/1b946035b5732deb69ff8a446843f1c5947ca49e))
* **TODO:** temporarily disable Deno/JSR publishing ([3479838](https://github.com/HaloSPV3/HCE.Shared/commit/347983862b0c19a62d1266824c75db72ef7a8917)), closes [#448](https://github.com/HaloSPV3/HCE.Shared/issues/448)
* try fixing GitLab asset label, path ([75463a0](https://github.com/HaloSPV3/HCE.Shared/commit/75463a02ce247b33c25435d1e4afa78d6748f8db))
* try fixing GitLab assets path AGAIN ([0bee0ae](https://github.com/HaloSPV3/HCE.Shared/commit/0bee0aee71e2da6707228820cec41c4a2248c44a))
* try increasing GitLab Release retry limit ([ff1e758](https://github.com/HaloSPV3/HCE.Shared/commit/ff1e758499602cbe02bee31fc217be4e91d2b423))
* use argument splatting ([6861778](https://github.com/HaloSPV3/HCE.Shared/commit/68617788184e3b9c56afaddd8c69461b2286312c))

### Reverts

* chore(vscode): fix task 'npm install on open' ([d33c9a7](https://github.com/HaloSPV3/HCE.Shared/commit/d33c9a7b4872359491bbc3b02339a3520e87c1b1))
* **utils.miscTypes, dotnet.NPP:** remove `isOfType` ([49a5911](https://github.com/HaloSPV3/HCE.Shared/commit/49a591148526372a9c27c0a9ed81dda81fa102c1))

### Code Refactoring

* deeply const `semanticReleaseConfig` `baseConfig` to expose values in type, but export as deeply mutable ([e2378a7](https://github.com/HaloSPV3/HCE.Shared/commit/e2378a7e724e0e027d047cf28ddb43c5df49405a))
* **dotnet.helpers:** overhaul `dotnetHelpers` ([fad8b4e](https://github.com/HaloSPV3/HCE.Shared/commit/fad8b4eebd066c1494f17f829316f70fa139af5f))
* **dotnet.NPP:** remove InstanceProperties GetUniquePropertyKeys; change readonly fields to getters; ensure types ([33a12a8](https://github.com/HaloSPV3/HCE.Shared/commit/33a12a89477973a4e7e00419d890e5e31f327639))
* **dotnet:** allow readonly array args where they are not modified ([2099344](https://github.com/HaloSPV3/HCE.Shared/commit/20993440f93657385d9434f0ee8ea370f88d18c6))
* **dotnet:** change read-only fields to getters. ([095ccee](https://github.com/HaloSPV3/HCE.Shared/commit/095ccee7d23946d72b968d6fec78953b00549248))
* **dotnet:** move `NugetRegistryPair`, `nugetDefault` to its own file ([4c24cf5](https://github.com/HaloSPV3/HCE.Shared/commit/4c24cf536a5454085a0269a114203c7db7216507))
* **dotnet:** pass each path in `string[]` `projectsToPublish` to `Evaluate`; allow passing `MSBP[]`, `NRI[]` to `configurePrepareCmd` ([71e5e5e](https://github.com/HaloSPV3/HCE.Shared/commit/71e5e5efb23795bd31ff6f8dde24f0b06903c187))
* **dotnet:** rename MSBuildProjectProperties.FullName to MSBuildProjectFullPath ([01aaac8](https://github.com/HaloSPV3/HCE.Shared/commit/01aaac846a8e6d7658c428e4b9c022da038c8223))
* **dotnet:** replace MSBuildProjectProperties constructor arg 'rest' with 'properties' ([6efde7d](https://github.com/HaloSPV3/HCE.Shared/commit/6efde7d16cd9a5b8d3a0e0b2e76d1c9921606ff9))
* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec` ([e44ef67](https://github.com/HaloSPV3/HCE.Shared/commit/e44ef67fb824ddf2a74f13bd4e08a4acc27a002f))
* move MSBuildProjectProperties to MSBuildProject.ts ([20fd130](https://github.com/HaloSPV3/HCE.Shared/commit/20fd13080bd17d33b3d44e4f8de550c6e54c218f))
* remove 'dotnet' facade ([f203a0c](https://github.com/HaloSPV3/HCE.Shared/commit/f203a0c8e258a26a4b18d29a3dcab2deec1ecfda))
* remove appendPlugins ([26d1e06](https://github.com/HaloSPV3/HCE.Shared/commit/26d1e068b581ef39901e4f2789f185317515ea1a))
* remove default export 'getConfig' ([baef25a](https://github.com/HaloSPV3/HCE.Shared/commit/baef25a60863af5d622f082620552b1ad0ed697c))
* remove param "exists" from MSBuildProjectProperties ctor ([34bcf54](https://github.com/HaloSPV3/HCE.Shared/commit/34bcf542a9b88c1c18a5878d8b48969d9898ae8b))
* remove property PredefinedProperties ([fcc4d55](https://github.com/HaloSPV3/HCE.Shared/commit/fcc4d5566e795007b2b4f0b6bcc418ec434026bb))
* remove static semantic-release config ([508a29d](https://github.com/HaloSPV3/HCE.Shared/commit/508a29d741de0fad327b424388d21eb83337efbd))
* rewrite dotnetGHPR, dotnetGLPR, NuGetRegistryInfo as classes ([e611a87](https://github.com/HaloSPV3/HCE.Shared/commit/e611a878fb8dfb821a25c19b8dc84b7c913575db))
* rewrite semanticReleaseConfigDotnet as class ([1ab49c5](https://github.com/HaloSPV3/HCE.Shared/commit/1ab49c5c6a8a766bb9e672e41663792a7cdef995))
* **semanticRelease:** change semanticReleaseConfig's baseConfig to const; add more type ([ba9fe61](https://github.com/HaloSPV3/HCE.Shared/commit/ba9fe6132c0f8467122c04c4b478817463221344))
* **semanticRelease:** change type of defaultPlugins to frozen "as const" string array ([fd2c935](https://github.com/HaloSPV3/HCE.Shared/commit/fd2c935b1ee34847b878d8d66a2e454961ed351a))

### Build System

* bump @semantic-release/github to v11.0.1 ([c7f068d](https://github.com/HaloSPV3/HCE.Shared/commit/c7f068d822be6f4c610e98b9de784a9173568daa))
* increase TypeScript target from ES5 to ES2022 ([339ebc6](https://github.com/HaloSPV3/HCE.Shared/commit/339ebc6be89d76cce15d8817840dd5e251e57e1e))
* manually set package version to 3.0.0 ([a6d7be2](https://github.com/HaloSPV3/HCE.Shared/commit/a6d7be20beee7aaf2e34eff91885684564b9ae55))
* migrate main export to mjs ([76345e8](https://github.com/HaloSPV3/HCE.Shared/commit/76345e81735ad0115d16b9d97a71ccdb1587a5bb))

## [3.0.0-develop.24](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.23...v3.0.0-develop.24) (2025-10-21)

### Bug Fixes

* **deps:** update semantic-release monorepo ([3c87c63](https://github.com/HaloSPV3/HCE.Shared/commit/3c87c638ed7784f41eb12f6dc3246675096e242e))

## [3.0.0-develop.23](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.22...v3.0.0-develop.23) (2025-10-06)

### Bug Fixes

* **deps:** update commitlint monorepo to v20 ([247558f](https://github.com/HaloSPV3/HCE.Shared/commit/247558f50593020cee13dc75e06647f36204eacc))

## [3.0.0-develop.22](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.21...v3.0.0-develop.22) (2025-10-05)

### Bug Fixes

* **dotnet.INVAP:** assign arg values to real props in `options` ([4af543d](https://github.com/HaloSPV3/HCE.Shared/commit/4af543d4f2d27cbff4a32ba464d94c1cb01aa302))
* **dotnet.SemanticRelease:** do not `await string[]` ([f56cc94](https://github.com/HaloSPV3/HCE.Shared/commit/f56cc949dbec7ac9953b3d0a90de1db7c43db2b3))

## [3.0.0-develop.21](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.20...v3.0.0-develop.21) (2025-08-14)

### Bug Fixes

* **dotnet, dotnet.PublishAll:** append `-p:Configuration=Release` to PublishAll commands ([3ebe7be](https://github.com/HaloSPV3/HCE.Shared/commit/3ebe7be14568f60005a894b465352b7c65cea00e))

## [3.0.0-develop.20](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.19...v3.0.0-develop.20) (2025-08-07)

### Bug Fixes

* **dotnet.ZPD:** beware of case-insensitive property names! Prefix private props with '_'; fix invalid condition expressions; add conditions to assignments ([60a25ce](https://github.com/HaloSPV3/HCE.Shared/commit/60a25ce54202e31003491e32016e47dd990acd4e))
* **dotnet.ZPD:** fix placeholders PropertyGroup condition almost always evaluating to `true` ([44f2fc4](https://github.com/HaloSPV3/HCE.Shared/commit/44f2fc4af1caf3d14c4fe27ba27154d79094a7a3))

## [3.0.0-develop.19](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.18...v3.0.0-develop.19) (2025-08-07)

### Bug Fixes

* **dotnet:** fix `-t:Publish` commands starting with `dotnet publish` instead of `dotnet msbuild` ([5d6bbca](https://github.com/HaloSPV3/HCE.Shared/commit/5d6bbca822131eeb2c76e184e6b4c036e161cc15))
* **dotnet:** fix PublishAll never running `_PublishProjectForAllFrameworksAndRuntimes` ([1717ea6](https://github.com/HaloSPV3/HCE.Shared/commit/1717ea6ac6256dcba00a61a62f0d270f0267a54d))

## [3.0.0-develop.18](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.17...v3.0.0-develop.18) (2025-08-05)

### Bug Fixes

* **dotnet.INVAP:** execute INVAP cli only if it's the main module ([5006ab1](https://github.com/HaloSPV3/HCE.Shared/commit/5006ab1d6ff46554f5fd17d076465fcc1e2018e6)), closes [#455](https://github.com/HaloSPV3/HCE.Shared/issues/455)

## [3.0.0-develop.17](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.16...v3.0.0-develop.17) (2025-07-31)

### Bug Fixes

* **dotnet:** do not mix `export *` and `export type *`! ([1184896](https://github.com/HaloSPV3/HCE.Shared/commit/118489616924fdb3d62670a67b1a0ab8123ba299))

## [3.0.0-develop.16](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.15...v3.0.0-develop.16) (2025-07-31)

### Bug Fixes

* **dotnet:** do not mix `export *` and `export type *`! ([859dfb4](https://github.com/HaloSPV3/HCE.Shared/commit/859dfb440b32258ddd34f36cb9f42f033b8b287a))

## [3.0.0-develop.15](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.14...v3.0.0-develop.15) (2025-07-31)

### Bug Fixes

* **dotnet.SemanticRelease:** swap out `console.debug` with colorful `debug` logging ([54029e1](https://github.com/HaloSPV3/HCE.Shared/commit/54029e1089e802ed6dcc02338b67118a67f7ecb4))

## [3.0.0-develop.14](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.13...v3.0.0-develop.14) (2025-07-31)

### Bug Fixes

* replace `debug.log` calls with `debug` call ([1b94603](https://github.com/HaloSPV3/HCE.Shared/commit/1b946035b5732deb69ff8a446843f1c5947ca49e))

## [3.0.0-develop.13](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.12...v3.0.0-develop.13) (2025-07-26)

### Bug Fixes

* remove second gitlab-sync ([b09f6c9](https://github.com/HaloSPV3/HCE.Shared/commit/b09f6c937a295d5bedcff85e8e32a4770b369ff2))

## [3.0.0-develop.12](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.11...v3.0.0-develop.12) (2025-07-26)

### Bug Fixes

* **TODO:** temporarily disable Deno/JSR publishing ([3479838](https://github.com/HaloSPV3/HCE.Shared/commit/347983862b0c19a62d1266824c75db72ef7a8917)), closes [#448](https://github.com/HaloSPV3/HCE.Shared/issues/448)

## [3.0.0-develop.11](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.10...v3.0.0-develop.11) (2025-07-26)

### Bug Fixes

* move gitlab `git push --tags` to `publish` step ([5faf150](https://github.com/HaloSPV3/HCE.Shared/commit/5faf1509f8176fd530c1041ee3384b3554ca1369))

## [3.0.0-develop.10](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.9...v3.0.0-develop.10) (2025-07-26)

### Bug Fixes

* avoid using implicitly fixed-length arrays ([02a2c2b](https://github.com/HaloSPV3/HCE.Shared/commit/02a2c2b880025fbd5e309d330f5546c6101ce3c0))

## [3.0.0-develop.9](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.8...v3.0.0-develop.9) (2025-07-24)

### Bug Fixes

* use argument splatting ([6861778](https://github.com/HaloSPV3/HCE.Shared/commit/68617788184e3b9c56afaddd8c69461b2286312c))

## [3.0.0-develop.8](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.7...v3.0.0-develop.8) (2025-07-24)

### Bug Fixes

* fix typo in $ghRegistry string ([8f8de0d](https://github.com/HaloSPV3/HCE.Shared/commit/8f8de0d5a23403f11824c839dc80a98025f06b04))

## [3.0.0-develop.7](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.6...v3.0.0-develop.7) (2025-07-24)

### ⚠ BREAKING CHANGES

* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec`

### Features

* export `@semantic-release/exec` `Options` interface ([331456e](https://github.com/HaloSPV3/HCE.Shared/commit/331456ed9ffe220f0270a1aefc3b34973c5ce64b))

### Bug Fixes

* disable `@semantic-release/npm` tarballDir config ([b4d2fb5](https://github.com/HaloSPV3/HCE.Shared/commit/b4d2fb50b368e5c66c323781fb094adee7f8fb01))
* try increasing GitLab Release retry limit ([ff1e758](https://github.com/HaloSPV3/HCE.Shared/commit/ff1e758499602cbe02bee31fc217be4e91d2b423))

### Code Refactoring

* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec` ([e44ef67](https://github.com/HaloSPV3/HCE.Shared/commit/e44ef67fb824ddf2a74f13bd4e08a4acc27a002f))

## [3.0.0-develop.7](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.6...v3.0.0-develop.7) (2025-07-24)

### ⚠ BREAKING CHANGES

* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec`

### Features

* export `@semantic-release/exec` `Options` interface ([331456e](https://github.com/HaloSPV3/HCE.Shared/commit/331456ed9ffe220f0270a1aefc3b34973c5ce64b))

### Bug Fixes

* try increasing GitLab Release retry limit ([ff1e758](https://github.com/HaloSPV3/HCE.Shared/commit/ff1e758499602cbe02bee31fc217be4e91d2b423))

### Code Refactoring

* **insertPlugins, semanticRelease:** allow only tuple `PluginSpec` ([e44ef67](https://github.com/HaloSPV3/HCE.Shared/commit/e44ef67fb824ddf2a74f13bd4e08a4acc27a002f))

## [3.0.0-develop.6](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.5...v3.0.0-develop.6) (2025-07-17)

### Bug Fixes

* try fixing GitLab asset label, path ([75463a0](https://github.com/HaloSPV3/HCE.Shared/commit/75463a02ce247b33c25435d1e4afa78d6748f8db))
* try fixing GitLab assets path AGAIN ([0bee0ae](https://github.com/HaloSPV3/HCE.Shared/commit/0bee0aee71e2da6707228820cec41c4a2248c44a))

## [3.0.0-develop.5](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.4...v3.0.0-develop.5) (2025-07-17)

### Features

* **insertPlugins:** add, export `insertPlugin`; declare internal `insertAndSortPlugins`; fix false-positive error caused by `!0` ([8971599](https://github.com/HaloSPV3/HCE.Shared/commit/8971599585dc962d5be6e7c3cc084f8c1a65d71c))

### Bug Fixes

* **dotnet.SemanticRelease:** append `@semantic-release/exec` plugin to plugins array if not found ([7eeafb2](https://github.com/HaloSPV3/HCE.Shared/commit/7eeafb2caab31358ecb91f8b3f1b885a11bc43b8))
* **dotnet.SemanticRelease:** set/append dummy pack, dummy push, and INVAP commands ([88a523e](https://github.com/HaloSPV3/HCE.Shared/commit/88a523e231a821b59b72af0dee785affa9889499))

## [3.0.0-develop.5](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.4...v3.0.0-develop.5) (2025-07-17)

### Features

* **insertPlugins:** add, export `insertPlugin`; declare internal `insertAndSortPlugins`; fix false-positive error caused by `!0` ([8971599](https://github.com/HaloSPV3/HCE.Shared/commit/8971599585dc962d5be6e7c3cc084f8c1a65d71c))

### Bug Fixes

* **dotnet.SemanticRelease:** append `@semantic-release/exec` plugin to plugins array if not found ([7eeafb2](https://github.com/HaloSPV3/HCE.Shared/commit/7eeafb2caab31358ecb91f8b3f1b885a11bc43b8))
* **dotnet.SemanticRelease:** set/append dummy pack, dummy push, and INVAP commands ([88a523e](https://github.com/HaloSPV3/HCE.Shared/commit/88a523e231a821b59b72af0dee785affa9889499))

## [3.0.0-develop.4](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.3...v3.0.0-develop.4) (2025-07-16)

### Bug Fixes

* **deps:** force `semantic-release-export-data` to use `@actions/core@1.11.1` to mitigate CVE-2025-22150 ([1b9cd9c](https://github.com/HaloSPV3/HCE.Shared/commit/1b9cd9c34f34b656f135ed9cd128366168df97b4))

## [3.0.0-develop.3](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.2...v3.0.0-develop.3) (2025-07-16)

### Bug Fixes

* don't forget to add the GHTuple object to the plugins list, overwriting the original GHTuple ([4b8e8a3](https://github.com/HaloSPV3/HCE.Shared/commit/4b8e8a3ec7215aa75785793006e6f0cd4a76ae60))

## [3.0.0-develop.2](https://github.com/HaloSPV3/HCE.Shared/compare/v3.0.0-develop.1...v3.0.0-develop.2) (2025-07-16)

### ⚠ BREAKING CHANGES

* manually set package version to 3.0.0

### Bug Fixes

* **deps, deps-dev, eslint:** upgrade group "eslint" for ESLint 9 ([173db90](https://github.com/HaloSPV3/HCE.Shared/commit/173db90e773f47219311280d71124c31573384ff))
* **deps, deps-dev:** bump group "eslint" ([b4bd1a5](https://github.com/HaloSPV3/HCE.Shared/commit/b4bd1a535548ce206b0b68b9cbb9b2f8830947a3))
* **deps, deps-dev:** update `@eslint/js`, `eslint` to v9.31.0 ([a3fe6e9](https://github.com/HaloSPV3/HCE.Shared/commit/a3fe6e9bb078bf5bab11008a44133e0108ec6614))
* **deps:** :ambulance: bump ws to 8.18.0 (>=8.17.1) ([d0dcf52](https://github.com/HaloSPV3/HCE.Shared/commit/d0dcf527ad2b98f550840c9375c92c2d15ae1d57))
* **deps:** 🚑️ fix GitHub advisories ([261fcf2](https://github.com/HaloSPV3/HCE.Shared/commit/261fcf253af789b99fdab47794a9efb737480851))
* **deps:** bump  `@types/node` to Node.js 20.11.x ([1a0ea53](https://github.com/HaloSPV3/HCE.Shared/commit/1a0ea5391f2b1c29445262852797b448acd81e8f))
* **deps:** bump @types/node to 20.19.4 ([24136f4](https://github.com/HaloSPV3/HCE.Shared/commit/24136f4f69857ab431af89cd36900bb975269b25))
* **deps:** bump `@octokit/request` to 9.2.4 ([a92bf8e](https://github.com/HaloSPV3/HCE.Shared/commit/a92bf8eb77566fd85188455f43614bcd09a843c3))
* **deps:** bump `@semantic-release/github` to 10.3.5 ([a6786fe](https://github.com/HaloSPV3/HCE.Shared/commit/a6786feeeb0ccd813b569b5fd8ee848c19e5c690))
* **deps:** bump ajv to 8.17.1 ([50bd762](https://github.com/HaloSPV3/HCE.Shared/commit/50bd762740228961a63b71d00c7199af33544d73))
* **deps:** bump globals to 15.15.0 ([8199785](https://github.com/HaloSPV3/HCE.Shared/commit/8199785fa01ea937b5cdc1a2c5d6fd44375f7c79))
* **deps:** bump group "commitlint" ([60f2fd4](https://github.com/HaloSPV3/HCE.Shared/commit/60f2fd4c1bb46a64c8d963efc976fab712dc2e71))
* **deps:** bump group "semantic-release" ([2aa0dff](https://github.com/HaloSPV3/HCE.Shared/commit/2aa0dff55f8cdb64509f2b5ab7ac2194f8268fb3))
* **deps:** bump husky to 9.1.7 ([b8b0b1e](https://github.com/HaloSPV3/HCE.Shared/commit/b8b0b1e4734f8705856e76e8ac89d8f3cd702960))
* **deps:** bump semantic-release-export-data to 2.8.1 ([1dccb43](https://github.com/HaloSPV3/HCE.Shared/commit/1dccb43ed95155bb69d1d56758b7548a0fd5e31e))
* **deps:** bump transitive dep tslib to 2.8.1 ([16b327f](https://github.com/HaloSPV3/HCE.Shared/commit/16b327f4af22f5750692a53aec6938d10f5420a5))
* **deps:** bump typescript to 5.8.3 ([19c0344](https://github.com/HaloSPV3/HCE.Shared/commit/19c03443e8f2f4a5efb1f6171af6e43dc413b5f0))
* **deps:** remove unused dep `@octokit/request` ([b000049](https://github.com/HaloSPV3/HCE.Shared/commit/b0000495bdaac34f300f5d5dbc3b495615465d84))
* **deps:** set `@types/node` semver range to PATCHes ([91395dd](https://github.com/HaloSPV3/HCE.Shared/commit/91395dd2408752b536c91887cc6092f0c3b0b929))
* **deps:** update `@dotenvx/dotenvx` to v1.47.6 ([a52fd9c](https://github.com/HaloSPV3/HCE.Shared/commit/a52fd9c0719024ef00cd836dbc654c4552cea3eb))
* **deps:** update `conventional-changelog-conventionalcommits` to v9.1.0 ([43cb289](https://github.com/HaloSPV3/HCE.Shared/commit/43cb2895345996220ec328686d0a2aa3e1f63a04))
* **deps:** update `semantic-release` to v24.2.7 ([5ed024b](https://github.com/HaloSPV3/HCE.Shared/commit/5ed024b8eac1db8de08ff7b0b7a6d3d8cc49900d))
* **deps:** update `typescript-eslint` to v8.37.0 ([7bb7852](https://github.com/HaloSPV3/HCE.Shared/commit/7bb78527922020b6a07302a905c4f58459bd8186))
* **deps:** update dependency globals to v16 ([#431](https://github.com/HaloSPV3/HCE.Shared/issues/431)) ([d7a440c](https://github.com/HaloSPV3/HCE.Shared/commit/d7a440c19c1e28ec2678198df3ad60bcaae2ca90))
* **dotnet.GHPR:** un-enclose `dotnet push` args; fix error detection ([ccdce25](https://github.com/HaloSPV3/HCE.Shared/commit/ccdce25aee4c27f406cb8353f98c38767d203f81))
* **dotnet.helpers, dotnet.GHPR:** remove `async` modifiers and `Promise` return types from all functions affecting `semanticReleaseConfigDotnet` ([659836c](https://github.com/HaloSPV3/HCE.Shared/commit/659836ca7424b434791d50585f4eafebcd78e446)), closes [#407](https://github.com/HaloSPV3/HCE.Shared/issues/407)
* **dotnet.helpers:** add missing `return` ([5998d54](https://github.com/HaloSPV3/HCE.Shared/commit/5998d54438e67849b9d305ff7c15b47ff4721456))
* fix apparently case-sensitive repo url for attestation/provenance ([19e1d72](https://github.com/HaloSPV3/HCE.Shared/commit/19e1d721eaf6a3137aa721ad80200f28b58a3134))

### Build System

* manually set package version to 3.0.0 ([a6d7be2](https://github.com/HaloSPV3/HCE.Shared/commit/a6d7be20beee7aaf2e34eff91885684564b9ae55))

## [3.0.0-develop.1](https://github.com/halospv3/hce.shared/compare/v2.6.0...v3.0.0-develop.1) (2025-07-15)

### ⚠ BREAKING CHANGES

* **deps, deps-dev:** bump `commitlint` deps to ^19.8.1; move `@commitlint/types` to dev deps
* deeply const `semanticReleaseConfig` `baseConfig` to expose values in type, but export as deeply mutable
* bump @semantic-release/github to v11.0.1
* **semanticRelease:** change semanticReleaseConfig's baseConfig to const; add more type
* **semanticRelease:** change type of defaultPlugins to frozen "as const" string array
* **dotnet.helpers:** overhaul `dotnetHelpers`
* **dotnet:** allow readonly array args where they are not modified
* **dotnet:** pass each path in `string[]` `projectsToPublish` to `Evaluate`; allow passing `MSBP[]`, `NRI[]` to `configurePrepareCmd`
* **dotnet.NRI:** add `NugetRegistryInfo`  arg/prop `project`; refactor `isTokenDefined`; add `DefaultTokenEnvVars`
* **dotnet:** move `NugetRegistryPair`, `nugetDefault` to its own file
* **dotnet.MSBP:** add MSBuildProject.Evaluate
* **dotnet:** refactor MSBuildProject
* **dotnet.NPP:** remove InstanceProperties GetUniquePropertyKeys; change readonly fields to getters; ensure types
* **dotnet:** change read-only fields to getters.
* **dotnet:** replace MSBuildProjectProperties constructor arg 'rest' with 'properties'
* **dotnet:** rename MSBuildProjectProperties.FullName to MSBuildProjectFullPath
* remove param "exists" from MSBuildProjectProperties ctor
* remove property PredefinedProperties
* remove default export 'getConfig'
* remove appendPlugins
* rewrite semanticReleaseConfigDotnet as class
* rewrite dotnetGHPR, dotnetGLPR, NuGetRegistryInfo as classes
* move MSBuildProjectProperties to MSBuildProject.ts
* remove 'dotnet' facade
* increase TypeScript target from ES5 to ES2022
* CJS is no longer supported
* remove static semantic-release config

### Features

* add `ProjectsToPublish`, `ProjectsToPackAndPush`, `EvaluatedProjects` to `SemanticReleaseConfigDotnet` ([bd37885](https://github.com/halospv3/hce.shared/commit/bd37885b58c5ed47a33b934d751106bfb7c04315))
* **CIM:** add CaseInsensitiveMap ([d6beb2a](https://github.com/halospv3/hce.shared/commit/d6beb2afe4eb9660059618e1c061e81465eea950))
* **dotnet, dotnet.NRI:** add `PackDummyPackage`; add `tmpDirNamespace`, `getDummiesDir` ([6023a4e](https://github.com/halospv3/hce.shared/commit/6023a4ef238f2650ccc7f53f91549c5a57f60442))
* **dotnet.GHNRI:** add `DefaultGithubTokenEnvVars`; update constructor args to satisfy NRI changes ([3bbcbf1](https://github.com/halospv3/hce.shared/commit/3bbcbf180fb01ed2d2a7bea3b2605925d41850bf))
* **dotnet.INVAP, dotnet.NRI:** add `GetIsNextVersionAlreadyPublishedCommand`, `getGithubOutput`, `getGithubOutputSync`, script for deferred execution of `IsNextVersionAlreadyPublished` ([970acb3](https://github.com/halospv3/hce.shared/commit/970acb34ded0db20d5fa692f8e731ccce7bc1d61))
* **dotnet.MSBP, dotnet.NPP, dotnet.SemanticRelease:** replace `GetNPPGetterNames` with `NPPGetterNames` ([38ea89d](https://github.com/halospv3/hce.shared/commit/38ea89df2a23a01c67bb983559fa08e7d9901230))
* **dotnet.MSBP, dotnet.NRI, utils.execAsync:** add `execAsync` wrapper; sort imports ([ca85fa2](https://github.com/halospv3/hce.shared/commit/ca85fa2b1a8b08760a8a09171e22e9fab06468f6))
* **dotnet.MSBP:** add `BaseOutputPath`, `OutDir` ([daf1c40](https://github.com/halospv3/hce.shared/commit/daf1c4029c1a542dda2de3fdd6fc19bca8abae7d))
* **dotnet.MSBP:** add MSBuildProject.Evaluate ([cbcf06b](https://github.com/halospv3/hce.shared/commit/cbcf06bb2d6339a37cf9b5dc86463b974df82461))
* **dotnet.MSBP:** add optional 'projTargets'  arguments to `Evaluate` ([9bd1328](https://github.com/halospv3/hce.shared/commit/9bd132805a1f1114b8ce4a03bf688d391c98a00b))
* **dotnet.MSBP:** add static method `MSBP.fromJSON` ([77f3d71](https://github.com/halospv3/hce.shared/commit/77f3d71546143736c0486c2bd4134956a1fa20a6))
* **dotnet.MSBP:** export MSBuildEvaluationOutput, some internal ArkType types ([a083f5a](https://github.com/halospv3/hce.shared/commit/a083f5a8469b528994fc1cb29be34365076aac26))
* **dotnet.MSBP:** expose `EvaluationOptions`, `EvaluationOptions.t` ([f1083c3](https://github.com/halospv3/hce.shared/commit/f1083c3eeebe41fd060b260daa20fcea220d1724))
* **dotnet.MSBPP:** add `BaseIntermediateOutputPath`, `IntermediateOutputPath` ([e5b6d19](https://github.com/halospv3/hce.shared/commit/e5b6d19548be494bcf5ce0514598ce96060ae7af))
* **dotnet.MSBPP:** copy and expose protected method `getAndForget` to type system ([cf05ca7](https://github.com/halospv3/hce.shared/commit/cf05ca7b8bf69bcf4b7f1a654d75dbdb32bdaddd))
* **dotnet.MSBPP:** export type `Class_MSBPP` for convenience ([88878bc](https://github.com/halospv3/hce.shared/commit/88878bc3157fc7bec4404a48f9b316f2aed33ef5))
* **dotnet.NPP:** add `GetNPPGetterNames` with result caching ([5e82143](https://github.com/halospv3/hce.shared/commit/5e82143c37fc4ac6c054e346e15d9fb6da341258))
* **dotnet.NPP:** add NugetProjectProperties ([a5bd9d5](https://github.com/halospv3/hce.shared/commit/a5bd9d518968ee70f01b6281b82d8ed877672d75))
* **dotnet.NPP:** export `ClassLike` type `Class_NPP` for convenience ([8a3618e](https://github.com/halospv3/hce.shared/commit/8a3618ebf051b135b94923e731e6eef4c41e9780))
* **dotnet.NRI:** add `GetNameForURL` ([5f635d9](https://github.com/halospv3/hce.shared/commit/5f635d9066543650f0a0b5ca3a8ad64fd5c6adb9))
* **dotnet.NRI:** add `GetPushDummyPackageCommand` ([00bb9f7](https://github.com/halospv3/hce.shared/commit/00bb9f7686350423a756c8cd056555c2dd73d58b))
* **dotnet.NRI:** add `NugetRegistryInfo`  arg/prop `project`; refactor `isTokenDefined`; add `DefaultTokenEnvVars` ([500a86a](https://github.com/halospv3/hce.shared/commit/500a86aefc953198fc0e43f3e9e150195e578dc2))
* **dotnet.NRI:** add `NugetRegistryInfoOptionsBase`, `NugetRegistryInfoOptions` ([f79de04](https://github.com/halospv3/hce.shared/commit/f79de0425305d40150e304c512b740a8a8817f4b))
* **dotnet.NRI:** add `PackPackagesOptionsType`, `GetPackCommand`; add `opts` param to `PackDummyPackage` ([e1f3a46](https://github.com/halospv3/hce.shared/commit/e1f3a4686dc937833392cfaa09ad545b4133485d))
* **dotnet.NRI:** add `PushPackagesOptionsType`, `GetPushCommand`, private `PushPackages` ([df7b9b3](https://github.com/halospv3/hce.shared/commit/df7b9b30991448b7279f115577ffcfa92b1cd084))
* **dotnet.NRI:** add types `NRI.PackDummyPackagesOptionsType`, `NRI.PushDummyPackagesOptionsType ([d9a53a8](https://github.com/halospv3/hce.shared/commit/d9a53a8d7e6936472f92bc20dc2305d7cb6cbf8c))
* **dotnet.SAP:** add target `SignAfterPack` ([ad1584f](https://github.com/halospv3/hce.shared/commit/ad1584f6d3244dfc784da93731f76fc099e936f9))
* **dotnet.SemanticRelease:** add method `getTokenTestingCommands` ([330724e](https://github.com/halospv3/hce.shared/commit/330724e58c7f2932bb109e18bfba9402e9ca45e1))
* **dotnet.SemanticRelease:** add method `splicePlugin` ([5c6963a](https://github.com/halospv3/hce.shared/commit/5c6963a66f73ec97ec246892750988fa83001254))
* **dotnet:** add `NugetRegistryPair.fromNugetRegistryInfoAsync` ([f5844ff](https://github.com/halospv3/hce.shared/commit/f5844ffe4545fdfe525817e1aac55736b2a153a7))
* **dotnet:** add MSBuildProjectProperties.GetFullPath ([360e317](https://github.com/halospv3/hce.shared/commit/360e317951017f6024f53dd54d46dfd20759606a))
* **dotnet:** add MSBuildProjectProperties.OutputPath ([de8d90c](https://github.com/halospv3/hce.shared/commit/de8d90c9ec1faf6b5fd78b41bf867e8274ea476d))
* **dotnet:** refactor MSBuildProject ([d743877](https://github.com/halospv3/hce.shared/commit/d743877ea10d8fcaa55517faa22db4dbf968a6ab))
* enable adding release links to bottom of GitHub releases ([bc20d5e](https://github.com/halospv3/hce.shared/commit/bc20d5e2a73395e14bcdd2b51538c57a29097c98))
* **eslint:** export config array separately from default export ([14b7f11](https://github.com/halospv3/hce.shared/commit/14b7f11b17479dd4d03625fc0902d01fe6c60b84))
* **semanticRelease:** add PluginSpec<P,T> and derived types for binding a plugin to its Options ([00e50a0](https://github.com/halospv3/hce.shared/commit/00e50a0b912ea2b8a315192823df1a841484a9c7))
* **utils.env:** enable passing options `loadDotenv` options to `getEnvVarValue` ([69b348c](https://github.com/halospv3/hce.shared/commit/69b348cddd899d56d951a988e581a3d98cf33aec))
* **utils.Exact:** export `Exact<T, S>` ([65db38a](https://github.com/halospv3/hce.shared/commit/65db38a0eb9cae858b1aa3c67c478de27a6160eb))
* **utils.execAsync:** add `ChildProcessSpawnException` for `execAsync` wrapper ([a1f032e](https://github.com/halospv3/hce.shared/commit/a1f032ec92498e930074f0a88e883725c85a406a))
* **utils.GracefulRecursion:** export GracefulRecursion types `Length<T>`, `TupleOf<N, T>`, `Pop<T>`, `Increment<N>`, `Decrement` ([dacf0b5](https://github.com/halospv3/hce.shared/commit/dacf0b5192d30ce5ea9a012806960db603fec88a))
* **utils.reflection.FL:** add type FunctionLike ([d236ee1](https://github.com/halospv3/hce.shared/commit/d236ee1fb86a109a964c3b025da117f49468c30b))
* **utils.reflection.GD:** add type `GetterDescriptor` ([7d0333c](https://github.com/halospv3/hce.shared/commit/7d0333cf3a7d10faee98dc550c231db2a3784e8d))
* **utils.reflection.getOPDs:** move `getOwnPropertyDescriptors` to its own file ([e860edd](https://github.com/halospv3/hce.shared/commit/e860eddccaea975cd115caec4ecf89ac6946e0e6))
* **utils.reflection.getOPDsR:** move `getOwnPropertyDescriptorsRecursively` and related types to their own file ([2cc8c04](https://github.com/halospv3/hce.shared/commit/2cc8c042de200702e95129f357c167cf628d2fe8))
* **utils.reflection.getPrototypeChainOf:** add function `getPrototypeChainOf` ([acf5d59](https://github.com/halospv3/hce.shared/commit/acf5d593c0cc6008af1a02d3ddd4777958cd6fef))
* **utils.reflection.inheritance, utils.reflection.getPrototypeOf:** add inheritance group ([9403382](https://github.com/halospv3/hce.shared/commit/94033822f8469ec1697b06ed98f7e909f7616b28))
* **utils.reflection.IPDM:** add type `InstancePropertyDescriptorMap` ([d3e8f61](https://github.com/halospv3/hce.shared/commit/d3e8f6177958927b5e7cbe80c8c91a77e44792ba))
* **utils.reflection.isConstructor:** add function `isConstructor` ([e6e551b](https://github.com/halospv3/hce.shared/commit/e6e551bcb516f99fdb72a4613b8433f46bb0c626))
* **utils.reflection.isGetterDescriptor:** add `isGetterDescriptor` ([c42a202](https://github.com/halospv3/hce.shared/commit/c42a202249693ced46534fdad37aa3a90d933d25))
* **utils.reflection.ITOSPDM:** add type `InstanceTypeOrSelfPropertyDescriptorMap` ([45e1030](https://github.com/halospv3/hce.shared/commit/45e10305db683910cad0f6021d09fab70792e327))
* **utils.reflection.OGDM:** add type `OwnGetterDescriptorMap` ([2b136f6](https://github.com/halospv3/hce.shared/commit/2b136f68220147f9102490ca61f25917d10ab3f3))
* **utils.reflection.OPDM:** add type `OwnPropertyDescriptorMap` ([15605d4](https://github.com/halospv3/hce.shared/commit/15605d47937a813e99da5f1821d2cde589078b7e))
* **utils.reflection.OwnKeyOf:** export utility type `OwnKeyOf<T, __proto__>` ([ef0f609](https://github.com/halospv3/hce.shared/commit/ef0f609ab2b7ef8a11ba94b83ca4811c50328018))
* **utils.reflection.PDM:** add PropertyDescriptorMap variant with extra type parameter for Omit ([9318a0e](https://github.com/halospv3/hce.shared/commit/9318a0ebe1251f93faa1728c21b4e69105137b86))
* **utils.reflection:** move `listOwnGetters` to its own file ([f6976f5](https://github.com/halospv3/hce.shared/commit/f6976f597d4f59666499f33135621849a7224a5b))
* **utils:** add miscTypes.ts ([11cefed](https://github.com/halospv3/hce.shared/commit/11cefed5e884df9eac187490d6445f2dcffb2d41))
* **utils:** add reflection.ts ([6fb70d8](https://github.com/halospv3/hce.shared/commit/6fb70d8e4b627b50f8b8a8d972a504d843f0ad3e))

### Bug Fixes

* **deps, deps-dev:** bump `commitlint` deps to ^19.8.1; move `@commitlint/types` to dev deps ([7b3eccd](https://github.com/halospv3/hce.shared/commit/7b3eccdefe8539ede9f9381e6476e35e704aef63))
* **deps, deps-dev:** upgrade `eslint` deps ([c50fdb8](https://github.com/halospv3/hce.shared/commit/c50fdb8b68464d0b288c37f6716d2eef744d6b57))
* **deps:** :ambulance: bump ws to 8.18.0 (>=8.17.1) ([97c20f8](https://github.com/halospv3/hce.shared/commit/97c20f804e1f255fba4eb9e6222de3d5d4ebbca7))
* **deps:** 🚑️ bump micromatch to v4.0.8 ([24676f1](https://github.com/halospv3/hce.shared/commit/24676f1b9b582029fadc29214b3e4bcd7c1e82ce))
* **deps:** bump @types/node to v22.9.0 ([b5ca498](https://github.com/halospv3/hce.shared/commit/b5ca49820d592ec78e14d8fea7b401ae07ef9da0))
* **deps:** bump `@types/node` to 22.15.34 ([918af5e](https://github.com/halospv3/hce.shared/commit/918af5ee8c23f653f784b42a850c066871b81a6a))
* **deps:** bump `arktype` to 2.1.20 ([5c8c17a](https://github.com/halospv3/hce.shared/commit/5c8c17a82448bfb7d05d37c3ac86b0c4b012cbb4))
* **deps:** bump `chardet` to ^2.1.0 ([997c286](https://github.com/halospv3/hce.shared/commit/997c286f5f7a79a5484eb1c961d6ebe247a3cf5a))
* **deps:** bump `conventional-changelog-conventionalcommits` to ^9.0.0 ([1d18454](https://github.com/halospv3/hce.shared/commit/1d184547e35c2d3294c9f5a0b90174491b116069))
* **deps:** bump `debug` to ^4.4.1 ([33bc96b](https://github.com/halospv3/hce.shared/commit/33bc96b1932cbba95ee33f9cd12aaf7d3358cc44))
* **deps:** bump `globals` to ^16.2.0 ([069801c](https://github.com/halospv3/hce.shared/commit/069801cce11cc167cb5536c2f3cb5d6ae51b424b))
* **deps:** bump `globals` to 16.3.0 ([6c4f22f](https://github.com/halospv3/hce.shared/commit/6c4f22f9c0636786246b2d685259fe79190d9b04))
* **deps:** bump `husky` to ^9.1.7 ([9aa7c29](https://github.com/halospv3/hce.shared/commit/9aa7c2997ae1a5d0a95835a57334f469f1788458))
* **deps:** bump `import-meta-resolve` to 4.1.0 ([c80930a](https://github.com/halospv3/hce.shared/commit/c80930a7cc4b95ea77bbeea0808df73c43793aa8))
* **deps:** bump `semantic-release-export-data` to ^1.1.0 ([824c790](https://github.com/halospv3/hce.shared/commit/824c7907e1c757b1ba35cc479844ae61db26d26f))
* **deps:** bump `semantic-release` to 24.2.6 ([9f24a9e](https://github.com/halospv3/hce.shared/commit/9f24a9ef6564281c245a4e0a0f5f10212c2e586b))
* **deps:** bump `ts-essentials` to ^10.1.1 ([9032d15](https://github.com/halospv3/hce.shared/commit/9032d15780a6cb3801e6a128ebb3318d5b2c3327))
* **deps:** bump `typescript-eslint` to ^8.34.0; remove redundant deps ([3e6d341](https://github.com/halospv3/hce.shared/commit/3e6d34172d2f1f6886c9d560913d76661f5c1571))
* **deps:** bump arktype from 2.0.0-rc.17 to 2.0.0-rc.21 ([54671dd](https://github.com/halospv3/hce.shared/commit/54671ddfb3606b50967871474bd56a8433fb9156))
* **deps:** bump arktype from 2.0.0-rc.6 to 2.0.0-rc.17 ([76a02b2](https://github.com/halospv3/hce.shared/commit/76a02b2433e0eaec9fa3c7eca7251fa7ec191478))
* **deps:** bump arktypes from v2.0.0-beta.2 to v2.0.0-rc.6 ([ae77ccd](https://github.com/halospv3/hce.shared/commit/ae77ccdff113e41f5360fd6679d82a9ac6f31207))
* **deps:** bump eslint-plugin-jsonc to v2.17.0 ([383317a](https://github.com/halospv3/hce.shared/commit/383317a51cba11e28bcf868cb3eeef11fae0bf22))
* **deps:** bump group typescript-eslint to v8.13.0 ([e0f1e98](https://github.com/halospv3/hce.shared/commit/e0f1e98219e5495d59bb59515f6764162d1e8893))
* **deps:** remove deprecated `@types/semantic-release` ([57536e0](https://github.com/halospv3/hce.shared/commit/57536e05789faedb2b3ced40a44b91bee5c14349))
* **deps:** remove unused dep `@octokit/request` ([8d5feba](https://github.com/halospv3/hce.shared/commit/8d5feba29a706a4c42e0b09ab7aa3e99d5c39e34))
* **deps:** replace `dotenv` with `@dotenvx/dotenvx`; move to runtime deps ([76b32b8](https://github.com/halospv3/hce.shared/commit/76b32b8be7a911d0938b8086bc51d1c685511c34))
* **deps:** update @eslint/plugin-kit to v0.2.3; update cross-spawn to v7.0.6 ([715ddf9](https://github.com/halospv3/hce.shared/commit/715ddf9dd10fa1a672578f77fe4acc4a95584de4))
* **deps:** update npm to v10.9.1 ([cd3b17f](https://github.com/halospv3/hce.shared/commit/cd3b17fd6cf58adbf5e103d76f5b386d417dc0d3))
* **deps:** upgrade `@babel/runtime`, `brace-expansion`, `undici` to mitigate CVEs ([b9d0cb2](https://github.com/halospv3/hce.shared/commit/b9d0cb27892f855d63a839db49869275f8cce6c4))
* **deps:** upgrade `@stylistic/eslint-plugin` to ^5.0.0 ([cb44505](https://github.com/halospv3/hce.shared/commit/cb44505e65b888c110541e3612a85cbaec3ba068))
* **deps:** upgrade `semantic-release` and its plugins ([6c2e4a5](https://github.com/halospv3/hce.shared/commit/6c2e4a5cfc44963b3a66e1f87584ed9561f0a9eb))
* **deps:** upgrade group "eslint" ([c1c3b5f](https://github.com/halospv3/hce.shared/commit/c1c3b5fd784f567312bfa26792edfb46936e1317))

### Reverts

* chore(vscode): fix task 'npm install on open' ([d33c9a7](https://github.com/halospv3/hce.shared/commit/d33c9a7b4872359491bbc3b02339a3520e87c1b1))
* **utils.miscTypes, dotnet.NPP:** remove `isOfType` ([49a5911](https://github.com/halospv3/hce.shared/commit/49a591148526372a9c27c0a9ed81dda81fa102c1))

### Code Refactoring

* deeply const `semanticReleaseConfig` `baseConfig` to expose values in type, but export as deeply mutable ([e2378a7](https://github.com/halospv3/hce.shared/commit/e2378a7e724e0e027d047cf28ddb43c5df49405a))
* **dotnet.helpers:** overhaul `dotnetHelpers` ([fad8b4e](https://github.com/halospv3/hce.shared/commit/fad8b4eebd066c1494f17f829316f70fa139af5f))
* **dotnet.NPP:** remove InstanceProperties GetUniquePropertyKeys; change readonly fields to getters; ensure types ([33a12a8](https://github.com/halospv3/hce.shared/commit/33a12a89477973a4e7e00419d890e5e31f327639))
* **dotnet:** allow readonly array args where they are not modified ([2099344](https://github.com/halospv3/hce.shared/commit/20993440f93657385d9434f0ee8ea370f88d18c6))
* **dotnet:** change read-only fields to getters. ([095ccee](https://github.com/halospv3/hce.shared/commit/095ccee7d23946d72b968d6fec78953b00549248))
* **dotnet:** move `NugetRegistryPair`, `nugetDefault` to its own file ([4c24cf5](https://github.com/halospv3/hce.shared/commit/4c24cf536a5454085a0269a114203c7db7216507))
* **dotnet:** pass each path in `string[]` `projectsToPublish` to `Evaluate`; allow passing `MSBP[]`, `NRI[]` to `configurePrepareCmd` ([71e5e5e](https://github.com/halospv3/hce.shared/commit/71e5e5efb23795bd31ff6f8dde24f0b06903c187))
* **dotnet:** rename MSBuildProjectProperties.FullName to MSBuildProjectFullPath ([01aaac8](https://github.com/halospv3/hce.shared/commit/01aaac846a8e6d7658c428e4b9c022da038c8223))
* **dotnet:** replace MSBuildProjectProperties constructor arg 'rest' with 'properties' ([6efde7d](https://github.com/halospv3/hce.shared/commit/6efde7d16cd9a5b8d3a0e0b2e76d1c9921606ff9))
* move MSBuildProjectProperties to MSBuildProject.ts ([20fd130](https://github.com/halospv3/hce.shared/commit/20fd13080bd17d33b3d44e4f8de550c6e54c218f))
* remove 'dotnet' facade ([f203a0c](https://github.com/halospv3/hce.shared/commit/f203a0c8e258a26a4b18d29a3dcab2deec1ecfda))
* remove appendPlugins ([26d1e06](https://github.com/halospv3/hce.shared/commit/26d1e068b581ef39901e4f2789f185317515ea1a))
* remove default export 'getConfig' ([baef25a](https://github.com/halospv3/hce.shared/commit/baef25a60863af5d622f082620552b1ad0ed697c))
* remove param "exists" from MSBuildProjectProperties ctor ([34bcf54](https://github.com/halospv3/hce.shared/commit/34bcf542a9b88c1c18a5878d8b48969d9898ae8b))
* remove property PredefinedProperties ([fcc4d55](https://github.com/halospv3/hce.shared/commit/fcc4d5566e795007b2b4f0b6bcc418ec434026bb))
* remove static semantic-release config ([508a29d](https://github.com/halospv3/hce.shared/commit/508a29d741de0fad327b424388d21eb83337efbd))
* rewrite dotnetGHPR, dotnetGLPR, NuGetRegistryInfo as classes ([e611a87](https://github.com/halospv3/hce.shared/commit/e611a878fb8dfb821a25c19b8dc84b7c913575db))
* rewrite semanticReleaseConfigDotnet as class ([1ab49c5](https://github.com/halospv3/hce.shared/commit/1ab49c5c6a8a766bb9e672e41663792a7cdef995))
* **semanticRelease:** change semanticReleaseConfig's baseConfig to const; add more type ([ba9fe61](https://github.com/halospv3/hce.shared/commit/ba9fe6132c0f8467122c04c4b478817463221344))
* **semanticRelease:** change type of defaultPlugins to frozen "as const" string array ([fd2c935](https://github.com/halospv3/hce.shared/commit/fd2c935b1ee34847b878d8d66a2e454961ed351a))

### Build System

* bump @semantic-release/github to v11.0.1 ([c7f068d](https://github.com/halospv3/hce.shared/commit/c7f068d822be6f4c610e98b9de784a9173568daa))
* increase TypeScript target from ES5 to ES2022 ([339ebc6](https://github.com/halospv3/hce.shared/commit/339ebc6be89d76cce15d8817840dd5e251e57e1e))
* migrate main export to mjs ([76345e8](https://github.com/halospv3/hce.shared/commit/76345e81735ad0115d16b9d97a71ccdb1587a5bb))

# Changelog

All notable changes to this project will be documented in this file. See
[commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version)
for commit guidelines.

## [2.6.6](https://github.com/halospv3/hce.shared/compare/v2.6.5...v2.6.6) (2025-07-30)

### Bug Fixes

* **deps:** ponyfill `string.replaceAll`; add core-js ([e65882e](https://github.com/halospv3/hce.shared/commit/e65882eb176b904831d81362bd2553a7a04ffbdf))
* **deps:** update `semantic-release-export-data` to v1.1.0; force it to resolve `@actions/core` to ^1.11.1 ([66fec8e](https://github.com/halospv3/hce.shared/commit/66fec8ed6ec602215ae657a78de6a63b79fb2fde))

## [2.6.5](https://github.com/halospv3/hce.shared/compare/v2.6.4...v2.6.5) (2025-07-15)

### Bug Fixes

* **deps:** update dependency globals to v16 ([#431](https://github.com/halospv3/hce.shared/issues/431)) ([d7a440c](https://github.com/halospv3/hce.shared/commit/d7a440c19c1e28ec2678198df3ad60bcaae2ca90))

## [2.6.4](https://github.com/halospv3/hce.shared/compare/v2.6.3...v2.6.4) (2025-07-03)

## [2.6.4-develop.3](https://github.com/halospv3/hce.shared/compare/v2.6.4-develop.2...v2.6.4-develop.3) (2025-07-03)

## [2.6.4-develop.2](https://github.com/halospv3/hce.shared/compare/v2.6.4-develop.1...v2.6.4-develop.2) (2025-07-03)

### Bug Fixes

* **deps:** update dependency globals to v16 ([#431](https://github.com/halospv3/hce.shared/issues/431)) ([d7a440c](https://github.com/halospv3/hce.shared/commit/d7a440c19c1e28ec2678198df3ad60bcaae2ca90))

## [2.6.4-develop.1](https://github.com/halospv3/hce.shared/compare/v2.6.3...v2.6.4-develop.1) (2025-07-03)

## [2.6.3](https://github.com/halospv3/hce.shared/compare/v2.6.2...v2.6.3) (2025-07-02)

### Bug Fixes

* **deps, deps-dev, eslint:** upgrade group "eslint" for ESLint 9 ([173db90](https://github.com/halospv3/hce.shared/commit/173db90e773f47219311280d71124c31573384ff))
* **deps, deps-dev:** bump group "eslint" ([b4bd1a5](https://github.com/halospv3/hce.shared/commit/b4bd1a535548ce206b0b68b9cbb9b2f8830947a3))
* **deps:** 🚑️ fix GitHub advisories ([261fcf2](https://github.com/halospv3/hce.shared/commit/261fcf253af789b99fdab47794a9efb737480851))
* **deps:** bump @types/node to 20.19.4 ([24136f4](https://github.com/halospv3/hce.shared/commit/24136f4f69857ab431af89cd36900bb975269b25))
* **deps:** bump `@octokit/request` to 9.2.4 ([a92bf8e](https://github.com/halospv3/hce.shared/commit/a92bf8eb77566fd85188455f43614bcd09a843c3))
* **deps:** bump `@semantic-release/github` to 10.3.5 ([a6786fe](https://github.com/halospv3/hce.shared/commit/a6786feeeb0ccd813b569b5fd8ee848c19e5c690))
* **deps:** bump ajv to 8.17.1 ([50bd762](https://github.com/halospv3/hce.shared/commit/50bd762740228961a63b71d00c7199af33544d73))
* **deps:** bump globals to 15.15.0 ([8199785](https://github.com/halospv3/hce.shared/commit/8199785fa01ea937b5cdc1a2c5d6fd44375f7c79))
* **deps:** bump group "commitlint" ([60f2fd4](https://github.com/halospv3/hce.shared/commit/60f2fd4c1bb46a64c8d963efc976fab712dc2e71))
* **deps:** bump group "semantic-release" ([2aa0dff](https://github.com/halospv3/hce.shared/commit/2aa0dff55f8cdb64509f2b5ab7ac2194f8268fb3))
* **deps:** bump husky to 9.1.7 ([b8b0b1e](https://github.com/halospv3/hce.shared/commit/b8b0b1e4734f8705856e76e8ac89d8f3cd702960))
* **deps:** bump semantic-release-export-data to 2.8.1 ([1dccb43](https://github.com/halospv3/hce.shared/commit/1dccb43ed95155bb69d1d56758b7548a0fd5e31e))
* **deps:** bump transitive dep tslib to 2.8.1 ([16b327f](https://github.com/halospv3/hce.shared/commit/16b327f4af22f5750692a53aec6938d10f5420a5))
* **deps:** bump typescript to 5.8.3 ([19c0344](https://github.com/halospv3/hce.shared/commit/19c03443e8f2f4a5efb1f6171af6e43dc413b5f0))
* **deps:** remove unused dep `@octokit/request` ([b000049](https://github.com/halospv3/hce.shared/commit/b0000495bdaac34f300f5d5dbc3b495615465d84))
* **dotnet.GHPR:** un-enclose `dotnet push` args; fix error detection ([ccdce25](https://github.com/halospv3/hce.shared/commit/ccdce25aee4c27f406cb8353f98c38767d203f81))
* **dotnet.helpers, dotnet.GHPR:** remove `async` modifiers and `Promise` return types from all functions affecting `semanticReleaseConfigDotnet` ([659836c](https://github.com/halospv3/hce.shared/commit/659836ca7424b434791d50585f4eafebcd78e446)), closes [#407](https://github.com/halospv3/hce.shared/issues/407)
* **dotnet.helpers:** add missing `return` ([5998d54](https://github.com/halospv3/hce.shared/commit/5998d54438e67849b9d305ff7c15b47ff4721456))

## [2.6.1-develop.3](https://github.com/halospv3/hce.shared/compare/v2.6.1-develop.2...v2.6.1-develop.3) (2025-03-19)

## [2.6.2](https://github.com/halospv3/hce.shared/compare/v2.6.1...v2.6.2) (2024-09-28)

## [2.6.1-develop.2](https://github.com/halospv3/hce.shared/compare/v2.6.1-develop.1...v2.6.1-develop.2) (2024-09-20)

## [2.6.1](https://github.com/halospv3/hce.shared/compare/v2.6.0...v2.6.1) (2024-07-23)

## [2.6.1-develop.1](https://github.com/halospv3/hce.shared/compare/v2.6.0...v2.6.1-develop.1) (2024-07-23)

### Bug Fixes

* **deps:** :ambulance: bump ws to 8.18.0 (>=8.17.1) ([d0dcf52](https://github.com/halospv3/hce.shared/commit/d0dcf527ad2b98f550840c9375c92c2d15ae1d57))

## [2.6.0](https://github.com/halospv3/hce.shared/compare/v2.5.0...v2.6.0) (2024-06-07)

### Features

* add createDummyNupkg
  ([ed67d06](https://github.com/halospv3/hce.shared/commit/ed67d06cd06e56a78b0a9ff2e51efb83ddd94386)),
  closes [#406](https://github.com/halospv3/hce.shared/issues/406)
* add EnvUtils (getEnvVarValue, getEnv)
  ([f86562a](https://github.com/halospv3/hce.shared/commit/f86562aa1c19a13a612e6571ba2122bf134ba196))

## [2.5.0](https://github.com/halospv3/hce.shared/compare/v2.4.3...v2.5.0) (2024-06-04)

### Features

* overhaul dotnetGHPR; misc refactors
  ([8d0a1d6](https://github.com/halospv3/hce.shared/commit/8d0a1d657e7f4754881c9a130fd4aa8191fb3e81))

### Bug Fixes

* **deps:** update dependency conventional-changelog-conventionalcommits to v8
  ([e1defcd](https://github.com/halospv3/hce.shared/commit/e1defcd94ba51eda7384c1ca87f33c9928610e20))
* **deps:** update semantic-release monorepo
  ([39fcf98](https://github.com/halospv3/hce.shared/commit/39fcf988fe55b894e269d64de1b48c7f8dfb950c))

## [2.4.3](https://github.com/halospv3/hce.shared/compare/v2.4.2...v2.4.3) (2024-05-31)

### Bug Fixes

* fix error being thrown because an 'else' is missing
  ([a4ed781](https://github.com/halospv3/hce.shared/commit/a4ed781dd9ebf696deae7b7914d8cf77e2beb5fb))

## [2.4.3-develop.1](https://github.com/halospv3/hce.shared/compare/v2.4.2...v2.4.3-develop.1) (2024-06-01)

### Bug Fixes

* **deps:** update dependency conventional-changelog-conventionalcommits to v8
  ([e1defcd](https://github.com/halospv3/hce.shared/commit/e1defcd94ba51eda7384c1ca87f33c9928610e20))
* **deps:** update semantic-release monorepo
  ([39fcf98](https://github.com/halospv3/hce.shared/commit/39fcf988fe55b894e269d64de1b48c7f8dfb950c))

## [2.4.2](https://github.com/halospv3/hce.shared/compare/v2.4.1...v2.4.2) (2024-05-31)

### Bug Fixes

* fix adding npm plugin to private semantic-release config
  ([fe2542b](https://github.com/halospv3/hce.shared/commit/fe2542b9e3d1dc3b3d00351f3dbef840b1f99486))

## [2.4.1](https://github.com/halospv3/hce.shared/compare/v2.4.0...v2.4.1) (2024-05-31)

### Bug Fixes

* :ambulance: bump braces to 3.0.3
  ([c4a0948](https://github.com/halospv3/hce.shared/commit/c4a09484c3e7c2f0337453e3543e4b143d5d026c))
* **deps:** :arrow_down: downgrade conventional-changelog-conventionalcommits
  ([7d7d418](https://github.com/halospv3/hce.shared/commit/7d7d418b072e57848207a7fcf368985adb76e016)),
  closes [#402](https://github.com/halospv3/hce.shared/issues/402)

## [2.4.1-develop.1](https://github.com/halospv3/hce.shared/compare/v2.4.0...v2.4.1-develop.1) (2024-05-31)

### Bug Fixes

* :ambulance: bump braces to 3.0.3
  ([c4a0948](https://github.com/halospv3/hce.shared/commit/c4a09484c3e7c2f0337453e3543e4b143d5d026c))
* **deps:** :arrow_down: downgrade conventional-changelog-conventionalcommits
  ([7d7d418](https://github.com/halospv3/hce.shared/commit/7d7d418b072e57848207a7fcf368985adb76e016)),
  closes [#402](https://github.com/halospv3/hce.shared/issues/402)

## [2.2.4](https://github.com/halospv3/hce.shared/compare/v2.2.3...v2.2.4) (2024-04-06)

## [2.2.3](https://github.com/halospv3/hce.shared/compare/v2.2.2...v2.2.3) (2024-03-29)

### Bug Fixes

* add commitlint config to package exports
  ([db87cc8](https://github.com/halospv3/hce.shared/commit/db87cc81f0e1718a6747f0ba6746f078685b6142))

## [2.2.2](https://github.com/halospv3/hce.shared/compare/v2.2.1...v2.2.2) (2024-03-29)

### Bug Fixes

* use the correct file extension for commitlint config in files array
  ([9f5bd5f](https://github.com/halospv3/hce.shared/commit/9f5bd5fd52b37ac4a86617bc921053a05a92c239))

## [2.2.1](https://github.com/halospv3/hce.shared/compare/v2.2.0...v2.2.1) (2024-03-29)

### Bug Fixes

* include commitlint config in package files
  ([26e2888](https://github.com/halospv3/hce.shared/commit/26e2888bdde302d7dd7a88b763975598a1eb539f))

## [2.2.0](https://github.com/halospv3/hce.shared/compare/v2.1.2...v2.2.0) (2024-03-29)

### Features

* **dotnet:** add GitVersion 6.0 config
  ([3784c72](https://github.com/halospv3/hce.shared/commit/3784c72ea2e37dcced13ccc322476f0d93d2bd9b))
* **dotnet:** add global "RepoRoot", "RepoRootPublishDir", and placeholder
  properties
  ([23d330a](https://github.com/halospv3/hce.shared/commit/23d330a2ca4769fcd14fe8f1a409f6801a7a1ea3))
* **dotnet:** rework ZipPublishDir
  ([618ba95](https://github.com/halospv3/hce.shared/commit/618ba95b3d731dc1b560e91757aa02e947b09e03))
* move commitlint config to shared file
  ([66efb30](https://github.com/halospv3/hce.shared/commit/66efb30a9e4351d02a761edf3a49722bc8a0f111))

### Bug Fixes

* **dotnet:** trim variant args; undefine if parentheses would be empty
  ([10414ff](https://github.com/halospv3/hce.shared/commit/10414ffc58950bae4d582d2263cbf9d7a51235eb)),
  closes [#356](https://github.com/halospv3/hce.shared/issues/356)

## [2.1.2](https://github.com/halospv3/hce.shared/compare/v2.1.1...v2.1.2) (2024-03-26)

### Bug Fixes

* **deps:** update dependency @semantic-release/release-notes-generator to v13
  ([0758bc9](https://github.com/halospv3/hce.shared/commit/0758bc9c9bb8338855880218e4c1086e25384baa))

## [2.1.1](https://github.com/halospv3/hce.shared/compare/v2.1.0...v2.1.1) (2024-03-26)

## [2.1.0](https://github.com/halospv3/hce.shared/compare/v2.0.1...v2.1.0) (2024-03-18)

### Features

* add plugin '@semantic-release/exec'
  ([61447fc](https://github.com/halospv3/hce.shared/commit/61447fcdef19db8cd7f103edd54354fa5c4cb202))

## [2.0.1](https://github.com/halospv3/hce.shared/compare/v2.0.0...v2.0.1) (2024-03-18)

### Bug Fixes

* **deps:** update dependency @semantic-release/commit-analyzer to v12
  ([87c6d12](https://github.com/halospv3/hce.shared/commit/87c6d12c3ab5243e50a0c1b0cf3dafd6c4c20ffa))
* **dotnet:** try making the '$(RepoRoot)/publish' directory before zipping
  ([0241146](https://github.com/halospv3/hce.shared/commit/024114698c89f557513a61400729a609d7637bf0))

## [2.0.0](https://github.com/halospv3/hce.shared/compare/v1.2.7...v2.0.0) (2024-03-17)

### ⚠ BREAKING CHANGES

* **node:** increase minimum version of NodeJS to 20.8.1 as required by
  semantic-release

### Bug Fixes

* add minimum npm version; error if required node, npm versions unavailable
  ([3969ad5](https://github.com/halospv3/hce.shared/commit/3969ad5a012f8e8330a14267a44d2c65f25b0690))
* **deps:** bump undici from 5.28.2 to 5.28.3
  ([7a6f822](https://github.com/halospv3/hce.shared/commit/7a6f8222c5fb83c7764765e956f7587971341da6))
* **deps:** update commitlint monorepo to v19
  ([9237ddb](https://github.com/halospv3/hce.shared/commit/9237ddbecd0b7d9dfbf50b96b9cc926da71ea165))
* **deps:** update dependency semantic-release to v23
  ([7e1a020](https://github.com/halospv3/hce.shared/commit/7e1a020ebf5bc87861c705789055540485713b4c))
* **deps:** update semantic-release monorepo
  ([ecd2ad3](https://github.com/halospv3/hce.shared/commit/ecd2ad33907e663cdf351481725a5f8a8ee439fb))

### Reverts

* use './' instead of 'file:'
  ([21fc83f](https://github.com/halospv3/hce.shared/commit/21fc83fef5d4bd1815ff4c2a4324559e40ae5519))

### Build System

* **node:** :arrow_up: raise minimum NodeJS version to 20.8.1
  ([cb92a3d](https://github.com/halospv3/hce.shared/commit/cb92a3d8917189464f36887b1e43bb099ecc175f))

## [1.2.7](https://github.com/halospv3/hce.shared/compare/v1.2.6...v1.2.7) (2024-01-06)

### Bug Fixes

* **deps:** bump @commitlint/cli from 18.4.3 to 18.4.4
  ([c732a4b](https://github.com/halospv3/hce.shared/commit/c732a4b9a7154954000b97ba0a2f79765dc6c1a8))
* **deps:** bump @commitlint/config-conventional from 18.4.3 to 18.4.4
  ([cd95f08](https://github.com/halospv3/hce.shared/commit/cd95f082805d3766384a13f5353cc61d7882a0d5))

## [1.2.6](https://github.com/halospv3/hce.shared/compare/v1.2.5...v1.2.6) (2024-01-05)

### Bug Fixes

* **deps:** update deps to latest stable versions
  ([dce4301](https://github.com/halospv3/hce.shared/commit/dce4301d4b0af26ba1b41aa7928ff79e7923bcb9))

## [1.2.5](https://github.com/halospv3/hce.shared/compare/v1.2.4...v1.2.5) (2023-12-24)

## [1.2.4](https://github.com/halospv3/hce.shared/compare/v1.2.3...v1.2.4) (2023-11-09)

### Bug Fixes

* **deps:** update commitlint monorepo to v18
  ([bc04ff0](https://github.com/halospv3/hce.shared/commit/bc04ff041084d91ab0c33edc73caf32ab9af765c))

## [1.2.3](https://github.com/halospv3/hce.shared/compare/v1.2.2...v1.2.3) (2023-11-09)

### Bug Fixes

* **dotnet:** change "MainLine" to "Mainline"
  ([430d588](https://github.com/halospv3/hce.shared/commit/430d5886d4e142d7a2d5c776457d5044346ce598))

## [1.2.2](https://github.com/halospv3/hce.shared/compare/v1.2.1...v1.2.2) (2023-11-09)

## [1.2.1](https://github.com/halospv3/hce.shared/compare/v1.2.0...v1.2.1) (2023-11-09)

## [1.2.0](https://github.com/halospv3/hce.shared/compare/v1.1.2...v1.2.0) (2023-10-24)

### Features

* **node:** include semantic-release-export-data by default
  ([d7bd6bf](https://github.com/halospv3/hce.shared/commit/d7bd6bf298fa26405366af2eba809c0c426de76d))
* **node:** publish _all_ files in ./publish/ directories
  ([82051be](https://github.com/halospv3/hce.shared/commit/82051bec96f1f37f12eb995fc4bd14afea9f5b31))

## [1.1.2](https://github.com/halospv3/hce.shared/compare/v1.1.1...v1.1.2) (2023-10-22)

### Bug Fixes

* **node:** prefix 'cjs' dir to exports' module entry points
  ([bf71890](https://github.com/halospv3/hce.shared/commit/bf7189037a5006ed589f55cd3c53d9c6f8f9d536))

## [1.1.1](https://github.com/halospv3/hce.shared/compare/v1.1.0...v1.1.1) (2023-10-19)

### Bug Fixes

* **node:** rerelease v1.1.0
  ([f01f34a](https://github.com/halospv3/hce.shared/commit/f01f34a2b39ed6d95ba670dccc864dc147d2452e))

## [1.1.0](https://github.com/halospv3/hce.shared/compare/v1.0.5...v1.1.0) (2023-10-19)

### Features

* add ZipPublishDir Target
  ([36755ac](https://github.com/halospv3/hce.shared/commit/36755ac51586a636ee91057adda94dbff1359c73))
* **node:** adopt Packemon for project management
  ([daafc7f](https://github.com/halospv3/hce.shared/commit/daafc7f74939f2793b1e3b8312fe95aa832614d3))
* **node:** load, validate, and export semantic-release shareable configuration
  ([74c11af](https://github.com/halospv3/hce.shared/commit/74c11af149f36be5e84a9ee064caaf50522017d1))

### Bug Fixes

* **deps:** update semantic-release monorepo
  ([b8dd3c2](https://github.com/halospv3/hce.shared/commit/b8dd3c2386d9f9717a7f916dcdbc1a1cc5a5f5c5))
* **deps:** update semantic-release monorepo
  ([f507178](https://github.com/halospv3/hce.shared/commit/f507178302719193bf323a2f9decb113c078e163))
* **dotnet:** always overwrite ZipPublishDir DestinationFile
  ([38ef324](https://github.com/halospv3/hce.shared/commit/38ef32430858ed1060077e7453f5f2825c7c6ab8))
* **node:** bump minimum Node version to 18.17.1
  ([92f5b47](https://github.com/halospv3/hce.shared/commit/92f5b47d40d1f9832b2e9f00b49579976b465166))
* **node:** lift main function body to top-level; assign to const and export it
  ([c0cc133](https://github.com/halospv3/hce.shared/commit/c0cc133d9d57949339d223f8aa12c123500c4d9c))
* **node:** remove use of semantic-release's private get-config, get-logger
  ([658b37c](https://github.com/halospv3/hce.shared/commit/658b37c6aee922a123b3c2128f5f588372bcbd7b))
* **node:** resolve "parameter 'options' implicitly 'any'" (TS7006)
  ([5fd278b](https://github.com/halospv3/hce.shared/commit/5fd278bf0983f63bf41db1484fd62df133993870))
* update destination path in ZipPublishDir
  ([b7bfc24](https://github.com/halospv3/hce.shared/commit/b7bfc24f4917628ef9837f94d6e3f87be4b54b1b))

### Reverts

* **node:** rename index.mts to index.ts
  ([f0cd2ee](https://github.com/halospv3/hce.shared/commit/f0cd2ee2bc1e1a4af7dde349d6df65c85944b035))

## [1.0.5](https://github.com/halospv3/hce.shared/compare/v1.0.4...v1.0.5) (2023-07-17)

### Bug Fixes

* **deps:** update dependency conventional-changelog-conventionalcommits to v6
  ([8f283e6](https://github.com/halospv3/hce.shared/commit/8f283e63fdc03d2fe04e04c25e4283dfa757d4ff))
* **deps:** update semantic-release monorepo
  ([8d14404](https://github.com/halospv3/hce.shared/commit/8d1440455fe38d74f6e2a585a22dea9707659a69))
* remove leftover mrm reference
  ([a60a1d2](https://github.com/halospv3/hce.shared/commit/a60a1d26f68149b364fb3c155fd605b48ea1cfc8))

## [1.0.4](https://github.com/halospv3/hce.shared/compare/v1.0.3...v1.0.4) (2023-05-26)

### Bug Fixes

* **deps:** change all devDependencies to dependencies
  ([79a4a30](https://github.com/halospv3/hce.shared/commit/79a4a3049d8c6f5f9c91a945bb06e0b2daea3cc7))

### 1.0.3 (2023-05-26)

### Bug Fixes

* **dev-deps:** import deps into index.js stub
  ([7fdb046](https://github.com/halospv3/hce.shared/commit/7fdb04646162dc205024c2b04af945e34d57b52c))
* **dev-deps:** remove commitizen, cz-conventional-changelog
  ([b91155a](https://github.com/halospv3/hce.shared/commit/b91155a7d4ba81af1432c520f55e3cb09c13089c))
* remove commitizen script
  ([46fdf69](https://github.com/halospv3/hce.shared/commit/46fdf6929bffbf63a81a2c2bfc06fb0d92e905e3))

## 1.0.2 (2021-12-29)

### Bug Fixes

* **dev-deps:** import deps into index.js stub
  ([7fdb046](https://github.com/halospv3/hce.shared/commit/7fdb04646162dc205024c2b04af945e34d57b52c))
* **dev-deps:** remove commitizen, cz-conventional-changelog
  ([b91155a](https://github.com/halospv3/hce.shared/commit/b91155a7d4ba81af1432c520f55e3cb09c13089c))
