import eslint from "@eslint/js";
import jsonc from "eslint-plugin-jsonc";
import { createRequire } from "module";
import tseslint, { type ConfigWithExtends } from "typescript-eslint";

// CJS compatibility; it started transpiling to a top-level await after upgrading from packemon 4.0.1 to 4.1.0
const require = createRequire(import.meta.url);
const globals = require("globals") as typeof import("globals", {with: {type: "json"}});
// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties
const globalIgnores: ConfigWithExtends = {
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
            eslint.configs.recommended as ConfigWithExtends,
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
                useProjectService: true
            },
            globals: globals.node
        }
    },
    globalIgnores
);