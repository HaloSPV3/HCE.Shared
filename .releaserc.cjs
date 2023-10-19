/** semantic-release
 * After HCE.Shared's Shareable Configuration (see 'static/.releaserc.yml', https://semantic-release.gitbook.io/semantic-release/usage/configuration#extends)
 * is loaded, the following semantic-release configuration is merged 
 * into the configuration object, overriding existing values.
 * Later, when a release is triggered, semantic-release will 
 * add any unspecified settings with default values.
 * 
 ** How to review the 'actual' config
 * `npx semantic-release--debug`.
 * 
 ** Plugins Configuration 
 * Plugins are configured via tuple-like arrays e.g. ['plugin name', {config object}].
 * 
 ** WARNING! Arrays and child objects are overwritten entirely.
 * When 'plugins' is set, only commit-analyzer is added if missing.
 */

/**
 * @type {import('semantic-release').Options}
 */
module.exports = {
    extends: './cjs/index.cjs', // static/.releaserc.yml
    plugins: [
        // https://github.com/semantic-release/commit-analyzer#options
        [
            "@semantic-release/commit-analyzer",
            {
                // description: https://github.com/semantic-release/commit-analyzer#releaserules
                // defaults: https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
                releaseRules: [
                    {
                        type: "(build|chore|fix)",
                        scope: "deps",
                        release: "patch"
                    }
                ]
            }
        ],
        "@semantic-release/release-notes-generator",
        "@semantic-release/changelog",
        // https://github.com/semantic-release/npm#options
        "@semantic-release/npm",
        // https://github.com/semantic-release/git#options
        "@semantic-release/git",
        [
            "@semantic-release/github",
            {
                assets: [
                    "./halospv3-hce.shared-*.*.*.tgz"
                ]
            }
        ]
    ]
}