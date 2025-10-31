
# TODO

- [ ] file://./dotnet/PublishAll.targets runs differently than expected. It is supposed to publish all "Release" permutations possible given TargetFramework(s) and RuntimeIdentifier(s). It works as intended for the most part. However, a project's conditions and properties are evaluated before PublishAll.targets overrides TFM/RID. The related conditional assignments are, therefore, unused.
- [ ] Users may wish to pass additional properties to the MSBuild Task. Luckily, the MSBuild Task has a `Properties` parameter we already use for overriding `TargetFramework` and/or `RuntimeIdentifier`.
