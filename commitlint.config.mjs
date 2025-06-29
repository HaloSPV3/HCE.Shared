import commitlintConfig from '@halospv3/hce.shared-config/commitlintConfig'
import { RuleConfigSeverity } from '@commitlint/types'
import vscodeSettingsJson from './.vscode/settings.json' with { type: 'json' }
/** @typedef {import('./.vscode/settings.json.d.ts')} VscodeSettings */
/** @typedef {import('@commitlint/types').RuleConfigCondition} RuleConfigCondition */
// Remember to update the d.ts! This should be part of TypeScript, but is blocked by https://github.com/microsoft/TypeScript/issues/32063
const gitCommitMessageEditorScopes = Object.freeze(
  /** @type {VscodeSettings['gitCommitMessageEditor.intelliSense.completion.scopes']} */
  (vscodeSettingsJson['gitCommitMessageEditor.intelliSense.completion.scopes']),
)

/** @type {import('@commitlint/types').UserConfig} */
export default {
  ...commitlintConfig,
  rules: {
    'scope-enum': Object.freeze([
      RuleConfigSeverity.Error,
      /** @type {RuleConfigCondition} */
      ('always'),
      gitCommitMessageEditorScopes.map(entry => entry.scope),
    ]),
  },
}
