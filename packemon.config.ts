import type { TransformOptions as BabelOptions } from '@babel/core'
import { writeFileSync } from 'node:fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { ConfigFile } from 'packemon'

export default {
  babelInput(config: BabelOptions) {
    writeFileSync(
      './babel.config.json',
      JSON.stringify(
        { ...config, caller: undefined, configFile: undefined } as BabelOptions,
        undefined,
        2,
      ),
      'utf8',
    )
  },
} as ConfigFile
