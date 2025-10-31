
# TODO

## dotnet.PublishAll

- [ ] file://./dotnet/PublishAll.targets runs differently than expected. It is supposed to publish all "Release" permutations possible given TargetFramework(s) and RuntimeIdentifier(s). It works as intended for the most part. However, a project's conditions and properties are evaluated before PublishAll.targets overrides TFM/RID. The related conditional assignments are, therefore, unused.
  - I had a solution in my head two months ago. I don't recall what it was. Exec Task?
  - This "no re-evaluation" issue makes it more difficult to, for example, enable PublishSelfContained or PublishSingleFile in compatible permutations.
  - This issue may have played a part in the Fody Weaver "Costura" config applying the same config to multiple permutations despite conditions being in place.
- [ ] Users may wish to pass additional properties to the MSBuild Task. Luckily, the MSBuild Task has a `Properties` parameter we already use for overriding `TargetFramework` and/or `RuntimeIdentifier`.
