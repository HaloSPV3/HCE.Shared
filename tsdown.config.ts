import { readdirSync } from 'node:fs';
import { defineConfig, type UserConfig } from 'tsdown';

const _config: UserConfig = defineConfig({
  dts: {
    build: true,
    sourcemap: true,
  },
  entry: {
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
  deps: { skipNodeModulesBundle: true },
  exports: {
    all: true,
    // .d.ts files are not auto-exported. `ls src/**.d.ts` */
    customExports(exports) {
      const declarations = readdirSync(
        './src/',
        { encoding: 'utf8', recursive: true },
      ).filter(v =>
        v.endsWith('.d.ts'),
      );

      if (declarations.length === 0)
        throw new Error('Where are my types???');

      let namepath;
      let filepath;
      // 'utils/Exact.d.ts'
      for (const d of declarations) {
        namepath = `./${d.replace('.d.ts', '')}`;
        filepath = `./src/${d}`;
        exports[namepath] = filepath;
      }
      return exports;
    },
  },
  outDir: './mjs',
  publint: true,
  tsconfig: './tsconfig.mjs.json',
  unbundle: true,
  unused: true,
});
export default _config;
