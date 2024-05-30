import jsonc from "eslint-plugin-jsonc";
import tseslint from "typescript-eslint";
import { type TSESLint } from "@typescript-eslint/utils";
import eslint from "@eslint/js";
// import { createRequire } from "module";
import globals from "globals/globals.json" with {type: "json"}

// CJS compatibility; @babel/plugin-proposal-json-module adds ESM syntax or calls undefined like it's a function
// const require = createRequire(import.meta.url);
// const globals = require("globals") as typeof import("globals", {with: {type: "json"}});
// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties

const globalIgnores: TSESLint.FlatConfig.Config = {
    name: "global ignores",
    ignores: [
        "_tsout/**/*",
        "_tsout/*",
        "_tsout/",
        "cjs/**/*",
        "cjs/*/*",
        "cjs/*",
        "mjs/**/*",
        "mjs/*",
        "mjs/",
        "node_modules/**/*",
        "**/node_modules/**/*"
    ]
};

export default tseslint.config(
    {
        name: "flat/recommended-with-json - https://github.com/ota-meshi/eslint-plugin-jsonc",
        extends: jsonc.configs["flat/recommended-with-json"],
        files: [
            "*.json",
            "**/*.json"
        ],
        ignores: globalIgnores.ignores
    },
    {
        name: "flat/recommended-with-json5 - https://github.com/ota-meshi/eslint-plugin-jsonc",
        extends: jsonc.configs["flat/recommended-with-json5"],
        files: [
            "*.json5",
            "**/*.json5"
        ],
        ignores: globalIgnores.ignores
    },
    {
        name: "flat/recommended-with-jsonc - https://github.com/ota-meshi/eslint-plugin-jsonc",
        extends: jsonc.configs["flat/recommended-with-jsonc"],
        files: [
            "*.jsonc",
            "**/*.jsonc"
        ],
        ignores: globalIgnores.ignores
    },
    {
        name: "TSJS",
        extends: [
            eslint.configs.recommended as TSESLint.FlatConfig.Config,
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic
        ],
        files: [
            "**/*.ts",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.cjs",
            "**/*.mjs"
        ],
        ignores: globalIgnores.ignores,
        languageOptions: {
            parserOptions: {
                project: true,
                // @ts-expect-error TS2322 Type '{ allowDefaultProjectForFiles: string[]; }' is not assignable to type 'boolean | undefined'.
                EXPERIMENTAL_useProjectService: {
                    allowDefaultProjectForFiles: [
                        "./*.js"
                    ],
                    maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 32
                }
            },
            globals: globals.node
        }
    },
    globalIgnores
);