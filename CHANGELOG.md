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

## [2.6.0](https://github.com/halospv3/hce.shared/compare/v2.5.0...v2.6.0) (2024-06-07)

### Features

- add createDummyNupkg
  ([ed67d06](https://github.com/halospv3/hce.shared/commit/ed67d06cd06e56a78b0a9ff2e51efb83ddd94386)),
  closes [#406](https://github.com/halospv3/hce.shared/issues/406)
- add EnvUtils (getEnvVarValue, getEnv)
  ([f86562a](https://github.com/halospv3/hce.shared/commit/f86562aa1c19a13a612e6571ba2122bf134ba196))

## [2.5.0](https://github.com/halospv3/hce.shared/compare/v2.4.3...v2.5.0) (2024-06-04)

### Features

- overhaul dotnetGHPR; misc refactors
  ([8d0a1d6](https://github.com/halospv3/hce.shared/commit/8d0a1d657e7f4754881c9a130fd4aa8191fb3e81))

### Bug Fixes

- **deps:** update dependency conventional-changelog-conventionalcommits to v8
  ([e1defcd](https://github.com/halospv3/hce.shared/commit/e1defcd94ba51eda7384c1ca87f33c9928610e20))
- **deps:** update semantic-release monorepo
  ([39fcf98](https://github.com/halospv3/hce.shared/commit/39fcf988fe55b894e269d64de1b48c7f8dfb950c))

## [2.4.3](https://github.com/halospv3/hce.shared/compare/v2.4.2...v2.4.3) (2024-05-31)

### Bug Fixes

- fix error being thrown because an 'else' is missing
  ([a4ed781](https://github.com/halospv3/hce.shared/commit/a4ed781dd9ebf696deae7b7914d8cf77e2beb5fb))

## [2.4.3-develop.1](https://github.com/halospv3/hce.shared/compare/v2.4.2...v2.4.3-develop.1) (2024-06-01)

### Bug Fixes

- **deps:** update dependency conventional-changelog-conventionalcommits to v8
  ([e1defcd](https://github.com/halospv3/hce.shared/commit/e1defcd94ba51eda7384c1ca87f33c9928610e20))
- **deps:** update semantic-release monorepo
  ([39fcf98](https://github.com/halospv3/hce.shared/commit/39fcf988fe55b894e269d64de1b48c7f8dfb950c))

## [2.4.2](https://github.com/halospv3/hce.shared/compare/v2.4.1...v2.4.2) (2024-05-31)

### Bug Fixes

- fix adding npm plugin to private semantic-release config
  ([fe2542b](https://github.com/halospv3/hce.shared/commit/fe2542b9e3d1dc3b3d00351f3dbef840b1f99486))

## [2.4.1](https://github.com/halospv3/hce.shared/compare/v2.4.0...v2.4.1) (2024-05-31)

### Bug Fixes

- :ambulance: bump braces to 3.0.3
  ([c4a0948](https://github.com/halospv3/hce.shared/commit/c4a09484c3e7c2f0337453e3543e4b143d5d026c))
- **deps:** :arrow_down: downgrade conventional-changelog-conventionalcommits
  ([7d7d418](https://github.com/halospv3/hce.shared/commit/7d7d418b072e57848207a7fcf368985adb76e016)),
  closes [#402](https://github.com/halospv3/hce.shared/issues/402)

## [2.4.1-develop.1](https://github.com/halospv3/hce.shared/compare/v2.4.0...v2.4.1-develop.1) (2024-05-31)

### Bug Fixes

- :ambulance: bump braces to 3.0.3
  ([c4a0948](https://github.com/halospv3/hce.shared/commit/c4a09484c3e7c2f0337453e3543e4b143d5d026c))
- **deps:** :arrow_down: downgrade conventional-changelog-conventionalcommits
  ([7d7d418](https://github.com/halospv3/hce.shared/commit/7d7d418b072e57848207a7fcf368985adb76e016)),
  closes [#402](https://github.com/halospv3/hce.shared/issues/402)

## [2.2.4](https://github.com/halospv3/hce.shared/compare/v2.2.3...v2.2.4) (2024-04-06)

## [2.2.3](https://github.com/halospv3/hce.shared/compare/v2.2.2...v2.2.3) (2024-03-29)

### Bug Fixes

- add commitlint config to package exports
  ([db87cc8](https://github.com/halospv3/hce.shared/commit/db87cc81f0e1718a6747f0ba6746f078685b6142))

## [2.2.2](https://github.com/halospv3/hce.shared/compare/v2.2.1...v2.2.2) (2024-03-29)

### Bug Fixes

- use the correct file extension for commitlint config in files array
  ([9f5bd5f](https://github.com/halospv3/hce.shared/commit/9f5bd5fd52b37ac4a86617bc921053a05a92c239))

## [2.2.1](https://github.com/halospv3/hce.shared/compare/v2.2.0...v2.2.1) (2024-03-29)

### Bug Fixes

- include commitlint config in package files
  ([26e2888](https://github.com/halospv3/hce.shared/commit/26e2888bdde302d7dd7a88b763975598a1eb539f))

## [2.2.0](https://github.com/halospv3/hce.shared/compare/v2.1.2...v2.2.0) (2024-03-29)

### Features

- **dotnet:** add GitVersion 6.0 config
  ([3784c72](https://github.com/halospv3/hce.shared/commit/3784c72ea2e37dcced13ccc322476f0d93d2bd9b))
- **dotnet:** add global "RepoRoot", "RepoRootPublishDir", and placeholder
  properties
  ([23d330a](https://github.com/halospv3/hce.shared/commit/23d330a2ca4769fcd14fe8f1a409f6801a7a1ea3))
- **dotnet:** rework ZipPublishDir
  ([618ba95](https://github.com/halospv3/hce.shared/commit/618ba95b3d731dc1b560e91757aa02e947b09e03))
- move commitlint config to shared file
  ([66efb30](https://github.com/halospv3/hce.shared/commit/66efb30a9e4351d02a761edf3a49722bc8a0f111))

### Bug Fixes

- **dotnet:** trim variant args; undefine if parentheses would be empty
  ([10414ff](https://github.com/halospv3/hce.shared/commit/10414ffc58950bae4d582d2263cbf9d7a51235eb)),
  closes [#356](https://github.com/halospv3/hce.shared/issues/356)

## [2.1.2](https://github.com/halospv3/hce.shared/compare/v2.1.1...v2.1.2) (2024-03-26)

### Bug Fixes

- **deps:** update dependency @semantic-release/release-notes-generator to v13
  ([0758bc9](https://github.com/halospv3/hce.shared/commit/0758bc9c9bb8338855880218e4c1086e25384baa))

## [2.1.1](https://github.com/halospv3/hce.shared/compare/v2.1.0...v2.1.1) (2024-03-26)

## [2.1.0](https://github.com/halospv3/hce.shared/compare/v2.0.1...v2.1.0) (2024-03-18)

### Features

- add plugin '@semantic-release/exec'
  ([61447fc](https://github.com/halospv3/hce.shared/commit/61447fcdef19db8cd7f103edd54354fa5c4cb202))

## [2.0.1](https://github.com/halospv3/hce.shared/compare/v2.0.0...v2.0.1) (2024-03-18)

### Bug Fixes

- **deps:** update dependency @semantic-release/commit-analyzer to v12
  ([87c6d12](https://github.com/halospv3/hce.shared/commit/87c6d12c3ab5243e50a0c1b0cf3dafd6c4c20ffa))
- **dotnet:** try making the '$(RepoRoot)/publish' directory before zipping
  ([0241146](https://github.com/halospv3/hce.shared/commit/024114698c89f557513a61400729a609d7637bf0))

## [2.0.0](https://github.com/halospv3/hce.shared/compare/v1.2.7...v2.0.0) (2024-03-17)

### ⚠ BREAKING CHANGES

- **node:** increase minimum version of NodeJS to 20.8.1 as required by
  semantic-release

### Bug Fixes

- add minimum npm version; error if required node, npm versions unavailable
  ([3969ad5](https://github.com/halospv3/hce.shared/commit/3969ad5a012f8e8330a14267a44d2c65f25b0690))
- **deps:** bump undici from 5.28.2 to 5.28.3
  ([7a6f822](https://github.com/halospv3/hce.shared/commit/7a6f8222c5fb83c7764765e956f7587971341da6))
- **deps:** update commitlint monorepo to v19
  ([9237ddb](https://github.com/halospv3/hce.shared/commit/9237ddbecd0b7d9dfbf50b96b9cc926da71ea165))
- **deps:** update dependency semantic-release to v23
  ([7e1a020](https://github.com/halospv3/hce.shared/commit/7e1a020ebf5bc87861c705789055540485713b4c))
- **deps:** update semantic-release monorepo
  ([ecd2ad3](https://github.com/halospv3/hce.shared/commit/ecd2ad33907e663cdf351481725a5f8a8ee439fb))

### Reverts

- use './' instead of 'file:'
  ([21fc83f](https://github.com/halospv3/hce.shared/commit/21fc83fef5d4bd1815ff4c2a4324559e40ae5519))

### Build System

- **node:** :arrow_up: raise minimum NodeJS version to 20.8.1
  ([cb92a3d](https://github.com/halospv3/hce.shared/commit/cb92a3d8917189464f36887b1e43bb099ecc175f))

## [1.2.7](https://github.com/halospv3/hce.shared/compare/v1.2.6...v1.2.7) (2024-01-06)

### Bug Fixes

- **deps:** bump @commitlint/cli from 18.4.3 to 18.4.4
  ([c732a4b](https://github.com/halospv3/hce.shared/commit/c732a4b9a7154954000b97ba0a2f79765dc6c1a8))
- **deps:** bump @commitlint/config-conventional from 18.4.3 to 18.4.4
  ([cd95f08](https://github.com/halospv3/hce.shared/commit/cd95f082805d3766384a13f5353cc61d7882a0d5))

## [1.2.6](https://github.com/halospv3/hce.shared/compare/v1.2.5...v1.2.6) (2024-01-05)

### Bug Fixes

- **deps:** update deps to latest stable versions
  ([dce4301](https://github.com/halospv3/hce.shared/commit/dce4301d4b0af26ba1b41aa7928ff79e7923bcb9))

## [1.2.5](https://github.com/halospv3/hce.shared/compare/v1.2.4...v1.2.5) (2023-12-24)

## [1.2.4](https://github.com/halospv3/hce.shared/compare/v1.2.3...v1.2.4) (2023-11-09)

### Bug Fixes

- **deps:** update commitlint monorepo to v18
  ([bc04ff0](https://github.com/halospv3/hce.shared/commit/bc04ff041084d91ab0c33edc73caf32ab9af765c))

## [1.2.3](https://github.com/halospv3/hce.shared/compare/v1.2.2...v1.2.3) (2023-11-09)

### Bug Fixes

- **dotnet:** change "MainLine" to "Mainline"
  ([430d588](https://github.com/halospv3/hce.shared/commit/430d5886d4e142d7a2d5c776457d5044346ce598))

## [1.2.2](https://github.com/halospv3/hce.shared/compare/v1.2.1...v1.2.2) (2023-11-09)

## [1.2.1](https://github.com/halospv3/hce.shared/compare/v1.2.0...v1.2.1) (2023-11-09)

## [1.2.0](https://github.com/halospv3/hce.shared/compare/v1.1.2...v1.2.0) (2023-10-24)

### Features

- **node:** include semantic-release-export-data by default
  ([d7bd6bf](https://github.com/halospv3/hce.shared/commit/d7bd6bf298fa26405366af2eba809c0c426de76d))
- **node:** publish _all_ files in ./publish/ directories
  ([82051be](https://github.com/halospv3/hce.shared/commit/82051bec96f1f37f12eb995fc4bd14afea9f5b31))

## [1.1.2](https://github.com/halospv3/hce.shared/compare/v1.1.1...v1.1.2) (2023-10-22)

### Bug Fixes

- **node:** prefix 'cjs' dir to exports' module entry points
  ([bf71890](https://github.com/halospv3/hce.shared/commit/bf7189037a5006ed589f55cd3c53d9c6f8f9d536))

## [1.1.1](https://github.com/halospv3/hce.shared/compare/v1.1.0...v1.1.1) (2023-10-19)

### Bug Fixes

- **node:** rerelease v1.1.0
  ([f01f34a](https://github.com/halospv3/hce.shared/commit/f01f34a2b39ed6d95ba670dccc864dc147d2452e))

## [1.1.0](https://github.com/halospv3/hce.shared/compare/v1.0.5...v1.1.0) (2023-10-19)

### Features

- add ZipPublishDir Target
  ([36755ac](https://github.com/halospv3/hce.shared/commit/36755ac51586a636ee91057adda94dbff1359c73))
- **node:** adopt Packemon for project management
  ([daafc7f](https://github.com/halospv3/hce.shared/commit/daafc7f74939f2793b1e3b8312fe95aa832614d3))
- **node:** load, validate, and export semantic-release shareable configuration
  ([74c11af](https://github.com/halospv3/hce.shared/commit/74c11af149f36be5e84a9ee064caaf50522017d1))

### Bug Fixes

- **deps:** update semantic-release monorepo
  ([b8dd3c2](https://github.com/halospv3/hce.shared/commit/b8dd3c2386d9f9717a7f916dcdbc1a1cc5a5f5c5))
- **deps:** update semantic-release monorepo
  ([f507178](https://github.com/halospv3/hce.shared/commit/f507178302719193bf323a2f9decb113c078e163))
- **dotnet:** always overwrite ZipPublishDir DestinationFile
  ([38ef324](https://github.com/halospv3/hce.shared/commit/38ef32430858ed1060077e7453f5f2825c7c6ab8))
- **node:** bump minimum Node version to 18.17.1
  ([92f5b47](https://github.com/halospv3/hce.shared/commit/92f5b47d40d1f9832b2e9f00b49579976b465166))
- **node:** lift main function body to top-level; assign to const and export it
  ([c0cc133](https://github.com/halospv3/hce.shared/commit/c0cc133d9d57949339d223f8aa12c123500c4d9c))
- **node:** remove use of semantic-release's private get-config, get-logger
  ([658b37c](https://github.com/halospv3/hce.shared/commit/658b37c6aee922a123b3c2128f5f588372bcbd7b))
- **node:** resolve "parameter 'options' implicitly 'any'" (TS7006)
  ([5fd278b](https://github.com/halospv3/hce.shared/commit/5fd278bf0983f63bf41db1484fd62df133993870))
- update destination path in ZipPublishDir
  ([b7bfc24](https://github.com/halospv3/hce.shared/commit/b7bfc24f4917628ef9837f94d6e3f87be4b54b1b))

### Reverts

- **node:** rename index.mts to index.ts
  ([f0cd2ee](https://github.com/halospv3/hce.shared/commit/f0cd2ee2bc1e1a4af7dde349d6df65c85944b035))

## [1.0.5](https://github.com/halospv3/hce.shared/compare/v1.0.4...v1.0.5) (2023-07-17)

### Bug Fixes

- **deps:** update dependency conventional-changelog-conventionalcommits to v6
  ([8f283e6](https://github.com/halospv3/hce.shared/commit/8f283e63fdc03d2fe04e04c25e4283dfa757d4ff))
- **deps:** update semantic-release monorepo
  ([8d14404](https://github.com/halospv3/hce.shared/commit/8d1440455fe38d74f6e2a585a22dea9707659a69))
- remove leftover mrm reference
  ([a60a1d2](https://github.com/halospv3/hce.shared/commit/a60a1d26f68149b364fb3c155fd605b48ea1cfc8))

## [1.0.4](https://github.com/halospv3/hce.shared/compare/v1.0.3...v1.0.4) (2023-05-26)

### Bug Fixes

- **deps:** change all devDependencies to dependencies
  ([79a4a30](https://github.com/halospv3/hce.shared/commit/79a4a3049d8c6f5f9c91a945bb06e0b2daea3cc7))

### 1.0.3 (2023-05-26)

### Bug Fixes

- **dev-deps:** import deps into index.js stub
  ([7fdb046](https://github.com/halospv3/hce.shared/commit/7fdb04646162dc205024c2b04af945e34d57b52c))
- **dev-deps:** remove commitizen, cz-conventional-changelog
  ([b91155a](https://github.com/halospv3/hce.shared/commit/b91155a7d4ba81af1432c520f55e3cb09c13089c))
- remove commitizen script
  ([46fdf69](https://github.com/halospv3/hce.shared/commit/46fdf6929bffbf63a81a2c2bfc06fb0d92e905e3))

## 1.0.2 (2021-12-29)

### Bug Fixes

- **dev-deps:** import deps into index.js stub
  ([7fdb046](https://github.com/halospv3/hce.shared/commit/7fdb04646162dc205024c2b04af945e34d57b52c))
- **dev-deps:** remove commitizen, cz-conventional-changelog
  ([b91155a](https://github.com/halospv3/hce.shared/commit/b91155a7d4ba81af1432c520f55e3cb09c13089c))
