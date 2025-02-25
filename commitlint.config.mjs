import { tsImport } from 'tsx/esm/api'
import { RuleConfigSeverity } from '@commitlint/types'
import vscodeSettingsJson from './.vscode/settings.json' with { type: 'json' }
import { join } from 'path'

/** @type {typeof import('./src/commitlintConfig.js').default} */
const commitlintConfig = await tsImport('./src/commitlintConfig.ts', join(import.meta.dirname, 'src'))

/** @typedef {import('./.vscode/settings.json.d.ts')} VscodeSettings */
/** @typedef {import('@commitlint/types').RuleConfigCondition} RuleConfigCondition */
// Remember to update the d.ts! This should be part of TypeScript, but is blocked by https://github.com/microsoft/TypeScript/issues/32063
const gitCommitMessageEditorScopes = Object.freeze(
  /** @type {VscodeSettings['gitCommitMessageEditor.intelliSense.completion.scopes']} */
  // eslint-disable-next-line @stylistic/no-extra-parens
  (vscodeSettingsJson['gitCommitMessageEditor.intelliSense.completion.scopes']),
)

/** @type {import('@commitlint/types').UserConfig} */
export default {
  ...commitlintConfig,
  // get and add all commit scopes defined in ./.vscode/settings.json for extension 'gitCommitMessageEditor'
  rules: {
    'scope-enum': Object.freeze([
      RuleConfigSeverity.Error,
      /** @type {RuleConfigCondition} */
      // eslint-disable-next-line @stylistic/no-extra-parens
      ('always'),
      gitCommitMessageEditorScopes.map(entry => entry.scope),
    ]),
  },
}
