import { defineConfig, type UserConfig } from 'tsdown';
import * as process from 'node:process';

const _config: UserConfig = defineConfig({
  entry: {
    main: './src/index.ts',
    // todo: remove as breaking change
    index: './src/index.ts',
    commitlintConfig: './src/commitlintConfig.ts',
    eslintConfig: './src/eslintConfig.ts',
    semanticReleaseConfig: './src/semanticReleaseConfig.ts',
    semanticReleaseConfigDotnet: './src/semanticReleaseConfigDotnet.ts',
    '*': './src/**/*.ts',
  },
  attw: { profile: 'esm-only' },
  checks: { circularDependency: true },
  copy: ['./src/**/*.d.ts', { from: './src/**/*.d.ts', to: './mjs/**/*.d.ts' }],
  deps: { skipNodeModulesBundle: true },
  exports: {
    all: true,
    devExports: process.env['CI']?.toLowerCase() != 'true',
  },
  minify: true,
  outDir: './mjs',
  publint: true,
  tsconfig: './tsconfig.mjs.json',
  unbundle: true,
  unused: true,
});
export default _config;
