import pcm from 'prettier-config-moon' with { type: 'json' };
export default {
	...{ ...pcm, $schema: undefined },
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
};
