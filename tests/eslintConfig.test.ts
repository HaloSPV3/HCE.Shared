import { describe, it, todo } from "node:test";
import eslintConfig from "@halospv3/hce.shared-config/eslintConfig";
import { ok } from "node:assert/strict";

await describe("eslintConfig", async () => {
    await it('exports an array', () => {
        ok(Array.isArray(eslintConfig))
    })
    await todo('excludes certain paths from linting');
});