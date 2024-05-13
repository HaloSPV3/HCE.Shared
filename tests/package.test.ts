import { ok } from "node:assert/strict"
import { describe, test } from "node:test"
import { packemon } from "../package.json" with {type: "json"}
import type { PackemonPackageConfig } from "../packemon.config.js"

/** 
 * todo: move to publicAPI text file similar to dotnet's publicAPI file 
 */
const desiredMjsExports = [
    "commitlintConfig",
    "dotnet/dotnetGHPR",
    "dotnet/dotnetGLPR",
    "dotnet/dotnetHelpers",
    "dotnet/dotnetMSBuildProject",
    "dotnet/dotnetMSBuildProjectProperties",
    "findStaticConfig",
    "index",
    "semanticReleaseConfig",
    "semanticReleaseConfigDotnet",
    "setupGitPluginSpec"
];

const importedMjsExports: string[] = [];
const newMjsExports: string[] = []

interface Result {
    action: string,
    entry: [string, string],
    validity: Error | Promise<Error | boolean> | boolean
}

async function tryCanImport(entry: Result["entry"]) {
    try {
        await import(`../${entry[1]}`) as unknown;
        importedMjsExports.push(entry[0]);
        return true;
    } catch (error) {
        return error instanceof Error
            ? error
            : new Error(JSON.stringify(error));
    }
}

await describe("package.json", async () => {
    // const { packemon } = pkg;
    const arr = (Array.isArray(packemon) ? packemon : [packemon]) as PackemonPackageConfig[];
    const packemonMjs = arr.find(v => v.format === "mjs" || (v.format === undefined && v.platform === "node"));

    const inputs = packemonMjs?.inputs;

    const awaitableResults: Result[] = [];

    if (inputs) {
        for await (const entry of Object.entries(inputs)) {
            awaitableResults.push(
                {
                    action: 'import',
                    entry: entry,
                    validity: await tryCanImport(entry)
                } as Result
            );
        }
    }

    const results = await Promise.all(awaitableResults);

    for await (const result of results) {
        await test(`Can ${result.action} ${result.entry[1]}?`, async () => {
            const valid = await result.validity;
            const error = valid instanceof Error ? valid : new Error()

            ok(valid === true, `Unable to ${result.action} ${result.entry[1]}. Reason:\n${error.message}`);
        })
    }

    const missingExports = desiredMjsExports.toSorted();
    importedMjsExports.sort();
    for (const m of importedMjsExports) {
        if (missingExports[0] === m)
            missingExports.shift();
        else
            newMjsExports.push(m);
    }

    ok(missingExports.length === 0, `One or more input modules (${missingExports.map(v => `"${v}"`).join(", ")}) were not imported! Is this a breaking change?`)

    ok(newMjsExports.length !== 1, `A module was added to the package's packemon inputs. Add the module's name ("${newMjsExports[0]}") to './tests/package.test.ts#desiredMjsExports' to ensure they are not accidentally removed later!`)
    ok(newMjsExports.length < 2, `Multiple modules were added to the package's packemon inputs. Add the modules' names (${newMjsExports.map(v => `"${v}"`).join(", ")}) to in './tests/package.test.ts#desiredMjsExports' to ensure they are not accidentally removed later!`)
});