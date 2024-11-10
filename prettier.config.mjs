import * as pcm from 'prettier-config-moon' with { type: 'json' }
export default {
  ...pcm,
  ...{
    overrides: [
      {
        files: '*.json',
        options: {
          trailingComma: 'none',
          bracketSameLine: true,
        },
      },
    ],
  },
}
