import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { NugetProjectProperties } from '@halospv3/hce.shared-config/dotnet/NugetProjectProperties';

await describe('NugetProjectProperties', async (c0) => {
    await it("has expected name", () => {
        strictEqual(NugetProjectProperties.name, c0.name);
    });
    await it('exists', () => {
        ok(NugetProjectProperties);
    });
    await it('has prototype', () => {
        ok("prototype" in NugetProjectProperties);
    });
    await describe("InstanceProperties", async (c1) => {
        await it("has expected name", () => {
            strictEqual(c1.name in NugetProjectProperties, true);
        });
        await it("is frozen", () => {
            strictEqual(Object.isFrozen(NugetProjectProperties.InstanceProperties), true);
        });
        await it("is array", () => {
            strictEqual(Array.isArray(NugetProjectProperties.InstanceProperties), true);
        });
        await it("is string[]", () => {
            strictEqual(NugetProjectProperties.InstanceProperties.every(v => typeof v === "string"), true);
        });
    });

    await describe("AssemblyName", async () => {
        await it("exists", () => {
            strictEqual("AssemblyName" in NugetProjectProperties.prototype, true)
        });
    });

    await todo("test remaining members");
});
