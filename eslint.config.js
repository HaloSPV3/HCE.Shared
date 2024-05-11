import { configs as jsoncConfigs } from "eslint-plugin-jsonc";
import moon from "eslint-config-moon";
import moon_node from "eslint-config-moon/node";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc"
import eslint from "@eslint/js";
import globals from "globals";

const flatCompat = new FlatCompat();

let jsonCfgs = {};
for (const cfg of jsoncConfigs["flat/recommended-with-json"]) {
    jsonCfgs = { ...jsonCfgs, ...cfg }
}

let jsoncCfgs = {};
for (const cfg of jsoncConfigs["flat/recommended-with-jsonc"]) {
    jsoncCfgs = { ...jsoncCfgs, ...cfg }
}

const configArray = tseslint.config(
    jsonCfgs,
    jsoncCfgs,
    {
        extends: [
            eslint.configs.recommended,
            ...flatCompat.config(moon.default),
            ...flatCompat.config(moon_node.default),
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked
        ],
        name: "halospv3/hce.shared-config (tests, root, TS)",
        files: ["*.ts", "*.*js", "tests/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { project: 'tsconfig.json' },
            globals: globals.node,
        }
    },
    {
        extends: [
            eslint.configs.recommended,
            ...flatCompat.config(moon.default),
            ...flatCompat.config(moon_node.default),
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked
        ],
        name: "halospv3/hce.shared-config (src)",
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { project: 'src/tsconfig.json' },
            globals: globals.node,
        }
    },
);

// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties

export default configArray;