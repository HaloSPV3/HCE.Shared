import { writeFileSync } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { ConfigFile } from 'packemon';

export default {
  babelInput(config: Record<string, unknown>) {
    writeFileSync(
      './babel.config.json',
      JSON.stringify(
        { ...config, caller: undefined, configFile: undefined },
        undefined,
        2,
      ) + '\n',
      'utf8',
    );
  },
} as ConfigFile;
