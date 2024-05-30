import type { TransformOptions as BabelOptions } from "@babel/core";
import type { Options as SwcOptions } from '@swc/core';
import { writeFileSync } from "fs";
import type { RollupOptions, OutputOptions as RollupOutputOptions } from 'rollup';
import packageJson from './package.json' with {type: "json"}
import { minVersion, gte } from 'semver'
import { ok } from "node:assert/strict";

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

const minNodeVersion = minVersion(packageJson.engines.node);
ok(minNodeVersion)
ok(gte(minNodeVersion, '20.8.1'), 'minNodeVersion is not greater than 20.8.1')
const minNodeMajorMinor = minNodeVersion.major + '.' + minNodeVersion.minor;

/**
 * @type {ConfigFile}
 */
export default {
    babelInput(config: BabelOptions) {
        config.targets = { node: minNodeMajorMinor }

        if (config.plugins == null)
            config.plugins = [];
        if (!config.plugins.join(';').includes('plugin-proposal-json-modules'))
            config.plugins.push('@babel/plugin-proposal-json-modules');

        console.log(JSON.stringify(config, null, 2))

        const tmp = { ...config, caller: undefined, configFile: undefined };
        writeFileSync("./babel.config.json", `${JSON.stringify(tmp, undefined, 2)}`, { encoding: "utf8" });
    }
};