import type { TransformOptions as BabelOptions } from '@babel/core'
import { writeFileSync } from 'node:fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { ConfigFile } from 'packemon'

export default {
  babelInput(config: BabelOptions) {
    const tmp = { ...config, caller: undefined, configFile: undefined }
    writeFileSync('./babel.config.json', JSON.stringify(tmp, undefined, 2), { encoding: 'utf8' })
  },
} as ConfigFile
