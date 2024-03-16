// https://www.npmjs.com/package/prettier-config-moon
import pcm from 'prettier-config-moon/prettier.json'
export default {
    ...pcm, ...{
        overrides: [
            {
                files: "*.json",
                options: {
                    trailingComma: "none",
                    bracketSameLine: true
                }
            }
        ]
    }
};;