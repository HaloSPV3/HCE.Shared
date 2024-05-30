import { FlatCompat } from "@eslint/eslintrc"
import eslintConfig from "@halospv3/hce.shared-config/eslintConfig"
import { config } from "typescript-eslint";
// @ts-ignore
import { default as moon } from 'eslint-config-moon';
// @ts-ignore
import { default as moonNode } from 'eslint-config-moon/node'
import { inspect } from "util";

inspect(moon);
inspect(moonNode)

const flatCompat = new FlatCompat({
    baseDirectory: __dirname,
})

export default config(
    ...eslintConfig,
    ...flatCompat.config(
        { extends: ["eslint-config-moon", 'eslint-config-moon/node'] }
    ).map(v => {
        v.files?.map(file => {
            if (typeof file === 'string' || (Array.isArray(file) && file.every(f_ => typeof f_ === 'string')))
                return file;
            if (typeof file === 'function') {
                /** @type {function} */
                const func = file;
                func(v)
                throw new TypeError("Only strings are allowed here. This glob pattern was instead a function. The function is...\n" + func.toString());
            }
            else
                throw new TypeError('flatConfig.files should be a string or a string[], not a ' + typeof file);
        });
        return v;
    }),
    {
        languageOptions: {
            parserOptions: {
                sourceType: "module",
                // @ts-expect-error TS2322 Type '{ allowDefaultProjectForFiles: string[]; }' is not assignable to type 'boolean | undefined'.
                EXPERIMENTAL_useProjectService: {
                    allowDefaultProjectForFiles: [
                        "./*.js"
                    ]
                }
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