/** @type {import('prettier').Config} */
export default {
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
};

// compare to file:///./eslint.config.mjs ! If you create a conflict, you'll be hit by a bus after two weeks! You might as well send in your notice of resignation, now.
