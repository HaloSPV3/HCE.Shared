import eslintConfig from "@halospv3/hce.shared-config/eslintConfig"
import { config } from "typescript-eslint";

export default config(
    ...eslintConfig,
    {
        languageOptions: {
            parserOptions: {
                sourceType: "module",
                projectService: true,
            }
        },
        files: [
            "src/**/*.ts",
            "tests/**/*.ts",
            "*.js",
            "*.mjs",
            "packemon.config.ts"
        ]
    }
);