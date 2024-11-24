import * as pcm from 'prettier-config-moon' with { type: 'json' }

/**
 * @typedef {import('prettier').Config} Config
 * @type {Config}
 */
const cfg = {
  ...pcm,
  // @ts-expect-error string literal doesn't implicit cast to string enum
  trailingComma: pcm.trailingComma,
  // @ts-expect-error string literal doesn't implicit cast to string enum
  proseWrap: pcm.proseWrap,
  overrides: [
    ...pcm.overrides,
    {
      files: ['*.json'],
      options: {
        trailingComma: 'none',
        bracketSameLine: true,
      },
    },
  ],

}

export default cfg
