import { configs as jsoncConfigs } from "eslint-plugin-jsonc";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import globals from "globals";

// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties

export default tseslint.config(
    ...jsoncConfigs["flat/recommended-with-json"],
    ...tseslint.config(
        {
            name: "halospv3/hce.shared-config",
            extends: [eslint.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked
            ],
            ignores: [
                "*.md",
                "**/*.json",
                "**/_tsout/",
                "**/mjs/",
                "**/node_modules/",
                "**/cjs/"
            ],
            languageOptions: {
                parser: tseslint.parser,
                parserOptions: {
                    project: true
                },
                globals: globals.node
            }
        }
    ),
    { ignores: ["**/_tsout/", "**/mjs/", "**/node_modules/", "**/cjs/"] }
);