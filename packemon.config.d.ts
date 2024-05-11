import type { TransformOptions as BabelOptions } from "@babel/core";
import type { Options as SwcOptions } from '@swc/core';
import type { RollupOptions, OutputOptions as RollupOutputOptions } from 'rollup';

// #region Types copied from packemon because it doesn't export declarations
type ApiType = 'private' | 'public';
interface PackemonPackageFeatures {
    cjsTypesCompat?: boolean;
    helpers?: 'bundled' | 'external' | 'inline' | 'runtime';
    swc?: boolean;
}
type InputMap = Record<string, string>;
type Support =
    // Latest version
    | 'current'
    // Next/future version
    | 'experimental'
    // Unsupported version
    | 'legacy'
    // Oldest version still supported
    | 'stable';
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
    // CommonJS modules with ".cjs" file extension
    | 'cjs'
    // ECMAScript modules with ".mjs" file extension
    | 'mjs';
type Format = BrowserFormat | NodeFormat;
type Platform = 'browser' | 'electron' | 'native' | 'node';
type Support =
    // Latest version
    | 'current'
    // Next/future version
    | 'experimental'
    // Unsupported version
    | 'legacy'
    // Oldest version still supported
    | 'stable';

// tests\package.test.ts
interface PackemonPackageConfig {
    api?: ApiType;
    bundle?: boolean;
    externals?: string[] | string;
    features?: PackemonPackageFeatures;
    format?: Format | Format[];
    inputs?: InputMap;
    namespace?: string;
    platform?: Platform | Platform[];
    support?: Support;
}

interface BuildParams {
    features: FeatureFlags;
    format: Format;
    platform: Platform;
    support: Support;
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