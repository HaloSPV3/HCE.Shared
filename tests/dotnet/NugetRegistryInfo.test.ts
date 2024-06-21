import { NugetRegistryInfo } from "@halospv3/hce.shared-config/dotnet/NugetRegistryInfo";
import { nugetDefault } from "@halospv3/hce.shared-config/dotnet/dotnetHelpers";
import { getEnvVarValue } from "@halospv3/hce.shared-config/envUtils";
import { notDeepStrictEqual } from "node:assert";
import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { inspect } from "node:util";

await describe("NugetRegistryInfo", async (ctx0) => {
    await it("is a class", async () => {
        // bullshit, but that's how classes are implemented
        deepStrictEqual(typeof NugetRegistryInfo, "function")
    });

    await it("has expected name", async () => {
        deepStrictEqual(NugetRegistryInfo.name, ctx0.name)
    })

    await describe("an instance of NugetRegistryInfo", async () => {
        const predefinedToken = getEnvVarValue("NUGET_TOKEN");

        await it("defaults url to expected value", async () => {
            process.env.NUGET_TOKEN ??= predefinedToken ?? "placeholder";

            strictEqual(new NugetRegistryInfo().url, "https://api.nuget.org/v3/index.json");

            if (predefinedToken)
                process.env.NUGET_TOKEN = predefinedToken;
            else
                delete process.env.NUGET_TOKEN;
        });

        await it("assigns first argument to url", async () => {
            process.env.NUGET_TOKEN ??= "placeholder"
            strictEqual(new NugetRegistryInfo("").url, "");
        });

        await describe("canPushPackagesToUrl", async () => {
            await it("rejects promise if token invalid", async () => {
                process.env.INVALID_TOKEN = "placeholder"
                const value = await new NugetRegistryInfo(nugetDefault.url, "INVALID_TOKEN")
                    .canPushPackagesToUrl
                    .catch(async (reason) =>
                        reason instanceof Error ? reason : new Error(String(reason)));
                if (value === true)
                    return notDeepStrictEqual(value, true)
                strictEqual("message" in value, true)
                strictEqual("name" in value, true)
            });

            await it("resolves when token is defined, valid, and can push packages to url", async (t) => {
                if (!predefinedToken)
                    return t.skip("NUGET_TOKEN environment variable undefined")

                const registryInfo = new NugetRegistryInfo();

                const canPush = await registryInfo.canPushPackagesToUrl.catch((reason) => {
                    const err = reason;
                    return (err instanceof Error) ? err : new Error(inspect(err, { depth: Infinity }));
                });

                if (canPush === true)
                    return;

                throw canPush;
            });
        });
    });

    await describe("canPushPackagesToUrl", (ctx1) => {
        it("exists in NugetRegistryInfo prototype", async () => {
            strictEqual(ctx1.name in NugetRegistryInfo.prototype, true);
        });

        it("returns Promise<true>", async () => {
            const x = await (Promise.resolve(true) as typeof NugetRegistryInfo.prototype.canPushPackagesToUrl);
            strictEqual(x, true);
        });
    });

    await describe("resolvedEnvVariable", async () => {
        await it("is undefined if not initialized", async () => {
            strictEqual(typeof NugetRegistryInfo.prototype.resolvedEnvVariable, "undefined")
        });

        await it("can be a string", async () => {
            const x = { resolvedEnvVariable: "" } as NugetRegistryInfo;
            strictEqual(typeof x.resolvedEnvVariable, "string");
        });
    });

    await describe("toRegistryPair", async (ctx1) => {
        await it("exists in NugetRegistryInfo prototype", async () => {
            strictEqual(ctx1.name in NugetRegistryInfo.prototype, true);
        })

        await it("is a function", async () => {
            strictEqual(typeof NugetRegistryInfo.prototype.toRegistryPair, "function");
        });

        await it("returns Promise<NugetRegistryPair>", async () => {
            const x = Promise.resolve({
                tokenEnvVar: "",
                url: "",
                user: ""
            }) as ReturnType<typeof NugetRegistryInfo.prototype.toRegistryPair>;

            deepStrictEqual(
                await x,
                {
                    tokenEnvVar: "",
                    url: "",
                    user: ""
                }
            );
        });
    });

    await describe("url", async (ctx1) => {
        await it("undefined in NugetRegistryInfo prototype", async () => {
            strictEqual(ctx1.name in NugetRegistryInfo.prototype, false);
            strictEqual(NugetRegistryInfo.prototype.url, undefined);
        })

        // This does not work. It is "any" with a value of "undefined"
        // await it("is a string", async () => {
        //     strictEqual(typeof NugetRegistryInfo.prototype.url, "string")
        // })
    })
});