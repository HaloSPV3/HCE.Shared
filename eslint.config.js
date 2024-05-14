// import { default as moon } from "eslint-config-moon";
// import { default as moonNode } from "eslint-config-moon/node";
// import { FlatCompat } from "@eslint/eslintrc"
import eslintConfig from "@halospv3/hce.shared-config/eslintConfig"

/**
 * @typedef {import("@typescript-eslint/utils").TSESLint.FlatConfig.Config} Config
 * @typedef {import("@typescript-eslint/utils").TSESLint.FlatConfig.ConfigArray} ConfigArray
 * @type {ConfigArray} 
 */
let configArray = eslintConfig;

export default configArray;