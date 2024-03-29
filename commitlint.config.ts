import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";
const commitlint: UserConfig = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "body-max-line-length": [RuleConfigSeverity.Disabled],
        "footer-max-line-length": [RuleConfigSeverity.Disabled],
        "header-max-length": [RuleConfigSeverity.Disabled]
    }
};
export default commitlint