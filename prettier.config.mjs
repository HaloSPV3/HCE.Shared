import pcm from 'prettier-config-moon' with { type: 'json' };

/***
 * stub for type validation
 * @param {import('prettier').Config} opts
 * @returns {import('prettier').Config}
 */
function config(opts) {
	return opts;
}

export default config({
	...{ .../** @type {import('prettier').Config} */(pcm), $schema: undefined },
	...{
		overrides: [
			{
				files: '*.json',
				options: {
					trailingComma: 'none',
					bracketSameLine: true,
					singleQuote: true
				},
			},
		],
	},
});
