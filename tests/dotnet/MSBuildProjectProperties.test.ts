import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { MSBuildProjectProperties } from '@halospv3/hce.shared-config/dotnet/MSBuildProjectProperties';

await describe('MSBuildProjectProperties', async (c0) => {
    await it("has expected name", () => {
        strictEqual(MSBuildProjectProperties.name, c0.name);
    });
    await it('exists', () => {
        ok(MSBuildProjectProperties);
    });
    await it('has prototype', () => {
        ok("prototype" in MSBuildProjectProperties);
    });
    await describe("InstanceProperties", async (c1) => {
        await it("has expected name", () => {
            strictEqual(c1.name in MSBuildProjectProperties, true);
        });
        await it("is frozen", () => {
            strictEqual(Object.isFrozen(MSBuildProjectProperties.InstanceProperties), true);
        });
        await it("is array", () => {
            strictEqual(Array.isArray(MSBuildProjectProperties.InstanceProperties), true);
        });
        await it("is string[]", () => {
            strictEqual(MSBuildProjectProperties.InstanceProperties.every(v => typeof v === "string"), true);
        });
    });

    await describe("AssemblyName", async () => {
        await it("exists", () => {
            strictEqual("AssemblyName" in MSBuildProjectProperties.prototype, true)
        });
    });

    await todo("test remaining members");
});