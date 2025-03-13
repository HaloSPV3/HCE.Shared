import type { Config } from 'prettier';

export default {
  proseWrap: 'always',
  singleQuote: true,

  overrides: [
    {
      files: ['*.json'],
      options: {
        parser: 'json-stringify',
        trailingComma: 'none',
      },
    },
  ],
} as Config;
