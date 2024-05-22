import type { TransformOptions as BabelOptions } from "@babel/core";
import type { Options as SwcOptions } from '@swc/core';
import { writeFileSync } from "fs";
import type { RollupOptions, OutputOptions as RollupOutputOptions } from 'rollup';

// #region Types copied from packemon because it doesn't export declarations
interface FeatureFlags {
    decorators?: boolean;
    flow?: boolean;
    react?: 'automatic' | 'classic';
    solid?: boolean;
    strict?: boolean;
    typescript?: boolean;
    typescriptComposite?: boolean;
}
// CommonJS modules with ".js" file extension
type CommonFormat = 'lib';
type BrowserFormat =
    | CommonFormat
    // ECMAScript modules with ".js" file extension
    | 'esm'
    // Universal Module Definition with ".js" file extension
    | 'umd';
type NodeFormat =
    | CommonFormat
    /* CommonJS modules with ".cjs" file extension */
    | 'cjs'
    // ECMAScript modules with ".mjs" file extension
    | 'mjs';
interface BuildParams {
    features: FeatureFlags;
    format: BrowserFormat | NodeFormat;
    platform: 'browser' | 'electron' | 'native' | 'node';
    support: | 'current'
    // Next/future version
    | 'experimental'
    // Unsupported version
    | 'legacy'
    // Oldest version still supported
    | 'stable';
}
type ConfigMutator<T> = (config: T) => void;
type ConfigMutatorWithBuild<T> = (config: T, build: BuildParams) => void;

export interface ConfigFile {
    babelInput?: ConfigMutator<BabelOptions>;
    babelOutput?: ConfigMutatorWithBuild<BabelOptions>;
    rollupInput?: ConfigMutator<RollupOptions>;
    rollupOutput?: ConfigMutatorWithBuild<RollupOutputOptions>;
    swc?: boolean;
    swcInput?: ConfigMutator<SwcOptions>;
    swcOutput?: ConfigMutatorWithBuild<SwcOptions>;
}

// #endregion Types

/**
 * @type {ConfigFile}
 */
export default {
    babelInput(config: BabelOptions) {
        // plugins
        if (config.plugins) {
            config.plugins.push(["@babel/plugin-syntax-import-attributes"]);
        }
        else config.plugins = ["@babel/plugin-syntax-import-attributes"];

        const tmp = { ...config, caller: undefined, configFile: undefined };
        writeFileSync("./babel.config.json", `${JSON.stringify(tmp, undefined, 2)}`, { encoding: "utf8" });
    }
};