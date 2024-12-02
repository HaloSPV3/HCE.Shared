/* eslint-disable @stylistic/quote-props */
import * as _pcm from 'prettier-config-moon' with { type: 'json' }
import { /* Hkt, */ type } from 'arktype'

function importPCM() {
  /** @typedef {Omit<_pcm,'default'>} PCM */
  /* eslint-disable @stylistic/no-extra-parens */
  return 'default' in _pcm && _pcm.default != null
    ? /** @type {PCM} */(_pcm.default)
    : _pcm
  /* eslint-enable @stylistic/no-extra-parens */
}

const T_BuiltInParserName
  = type('"acorn"')
    .or('"angular"')
    .or('"babel-flow"')
    .or('"babel-ts"')
    .or('"babel"')
    .or('"css"')
    .or('"espree"')
    .or('"flow"')
    .or('"glimmer"')
    .or('"graphql"')
    .or('"html"')
    .or('"json-stringify"')
    .or('"json"')
    .or('"json5"')
    .or('"jsonc"')
    .or('"less"')
    .or('"lwc"')
    .or('"markdown"')
    .or('"mdx"')
    .or('"meriyah"')
    .or('"scss"')
    .or('"typescript"')
    .or('"vue"')
    .or('"yaml"')

// const T_SupportLanguage = type({
//   name: 'string',
//   since: 'string?',
//   parsers: T_BuiltInParserName.array().or('string[]'),
//   group: 'string?',
//   tmScope: 'string?',
//   aceMode: 'string?',
//   codemirrorMode: 'string?',
//   codemirrorMimeType: 'string?',
//   aliases: 'string[]?',
//   extensions: 'string[]?',
//   filenames: 'string[]?',
//   linguistLanguageId: 'number?',
//   vscodeLanguageIds: 'string[]?',
//   interpreters: 'string[]?',
// })
// const T_Parser_T = type(
//   '<t>',
//   type({
//     parse: type.unknown.or(
//       type(
//         '<t>',
//         // eslint-disable-next-line @stylistic/no-extra-parens
//         type.instanceOf(/** @Type {Promise<t>} */(Promise)),
//       ),
//     ),
//     astFormat: 'string',
//     hasPragma: type.unknown,
//     locStart: type.unknown,
//     locEnd: type.unknown,
//     'preprocess?': type.unknown,
//   }),
// )
// const T_Printer_T = type('<T>', {
//   print: type.unknown,
//   'embed?': type.unknown,
//   'preprocess?': type.unknown,
//   'insertPragma?': type.unknown,
//   'massageAstNode?': type.unknown,
//   'hasPrettierIgnore?': type.unknown,
//   'canAttachComment?': type.unknown,
//   'isBlockComment?': type.unknown,
//   'willPrintOwnComments?': type.unknown,
//   'printComment?': type.unknown,
//   'getCommentChildNodes?': type.unknown,
//   'handleComments?': type({
//     'ownLine?': type.unknown,
//     'endOfLine?': type.unknown,
//     'remaining?': type.unknown,
//   }),
//   'getVisitorKeys?': type.unknown,
// })
// const T_SupportOptionType = type('"int" | "string" | "boolean" | "choice" | "path"')
// const T_BaseSupportOption = type.generic(['Type', T_SupportOptionType])(
//   args => type({
//     // readonly
//     name: type('string?'),
//     category: 'string',
//     type: args['Type'],
//     deprecated: type('true | string').optional(),
//     description: 'string?',
//   }),
//   class T_BaseSupportOptionHkt extends Hkt {
//     // @ts-expect-error should be a 'declare' with a type, but that's not possible in MJS
//     body
//   },
// )
// const T_SupportOptionRange = type({
//   start: 'number',
//   end: 'number',
//   step: 'number',
// })
// const T_IntSupportOption = T_BaseSupportOption('"int"').and({
//   default: 'number?',
//   array: 'false?',
//   range: T_SupportOptionRange.optional(),
// })
// const T_IntArraySupportOption = T_BaseSupportOption('"int"').and({
//   default: 'number?',
//   array: 'false?',
//   range: T_SupportOptionRange.optional(),
// })
// const T_StringSupportOption = T_BaseSupportOption('"string"').and({
//   default: 'string?',
//   array: 'false?',
// })
// const T_StringArraySupportOption = T_BaseSupportOption('"string"').and({
//   default: type({ value: 'string[]' }).array().optional(),
//   array: 'false?',
// })
// const T_BooleanSupportOption = T_BaseSupportOption('"boolean"').and({
//   default: 'boolean?',
//   array: 'false?',
//   description: 'string',
//   oppositeDescription: 'string?',
// })
// const T_BooleanArraySupportOption = T_BaseSupportOption('"boolean"').and({
//   default: type({ value: 'boolean[]' }).array().optional(),
//   array: 'true',
// })
// const T_ChoiceSupportOption = type.generic(['Value', type.unknown])(
//   args => type({
//     default: type(args['Value']).or(type({ value: args['Value'] }).array()).optional(),
//     description: 'string',
//     choices: type({
//       since: 'string?',
//       value: type(args['Value']),
//       description: 'string',
//     }).array(),
//   }),
//   class T_ChoiceSupportOptionHkt extends Hkt {
//     /** @type {any} */
//     body
//   },
// )
// const T_PathSupportOption = T_BaseSupportOption('"path"').and({
//   default: 'string?',
//   array: 'false?',
// })
// const T_PathArraySupportOption = T_BaseSupportOption('"path"').and({
//   default: type({ value: 'string[]' }).array().optional(),
//   array: 'true',
// })
// const T_SupportOption = T_IntSupportOption
//   .or(T_IntArraySupportOption)
//   .or(T_StringSupportOption)
//   .or(T_StringArraySupportOption)
//   .or(T_BooleanSupportOption)
//   .or(T_BooleanArraySupportOption)
//   .or(T_ChoiceSupportOption)
//   .or(T_PathSupportOption)
//   .or(T_PathArraySupportOption)
// const T_SupportOptions = type.Record('string', T_SupportOption)
// const T_PartialRequiredOptions = type({}).partial()
//   .and({
//     /**
//    * Specify the line length that the printer will wrap on.
//    * @default 80
//    */
//     printWidth: 'number',
//     /**
//      * Specify the number of spaces per indentation-level.
//      * @default 2
//      */
//     tabWidth: 'number',
//     /**
//      * Indent lines with tabs instead of spaces
//      * @default false
//      */
//     useTabs: 'boolean?',
//     parentParser: 'string?',
//     __embeddedInHtml: 'boolean?',
//   })
// const T_Plugin = type.generic('<T>')(
//   (args) => {
//     return type({
//       'languages?': T_SupportLanguage.array(),
//       'parsers?': type.Record(type.string, T_Parser_T(args['<T>'])),
//       'printers?': type.Record(type.string, T_Printer_T(args['<T>'])),
//       'options?': T_SupportOptions,
//       'defaultOptions?': T_PartialRequiredOptions,
//     })
//   },
//   class T_PluginHkt extends Hkt {
//     /** @type {any} */
//     body
//   },
// )
const T_Options = type({
  /**
   * Print semicolons at the ends of statements.
   * @default true
   */
  semi: 'boolean',
  /**
   * Use single quotes instead of double quotes.
   * @default false
   */
  singleQuote: 'boolean',
  /**
   * Use single quotes in JSX.
   * @default false
   */
  jsxSingleQuote: 'boolean',
  /**
   * Print trailing commas wherever possible.
   * @default "all"
   */
  trailingComma: '"none" | "es5" | "all"',
  /**
   * Print spaces between brackets in object literals.
   * @default true
   */
  bracketSpacing: 'boolean',
  /**
   * Put the `> ` of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being
   * alone on the next line (does not apply to self closing elements).
   * @default false
   */
  bracketSameLine: 'boolean',
  /**
   * Format only a segment of a file.
   * @default 0
   */
  rangeStart: 'number',
  /**
   * Format only a segment of a file.
   * @default Number.POSITIVE_INFINITY
   */
  rangeEnd: 'number',
  /**
   * Specify which parser to use.
   */
  parser: T_BuiltInParserName,
  /**
   * Specify the input filepath. This will be used to do parser inference.
   */
  filepath: 'string',
  /**
   * Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file.
   * This is very useful when gradually transitioning large, unformatted codebases to prettier.
   * @default false
   */
  requirePragma: 'boolean',
  /**
   * Prettier can insert a special @format marker at the top of files specifying that
   * the file has been formatted with prettier. This works well when used in tandem with
   * the --require-pragma option. If there is already a docblock at the top of
   * the file then this option will add a newline to it with the @format marker.
   * @default false
   */
  insertPragma: 'boolean',
  /**
   * By default, Prettier will wrap markdown text as-is since some services use a linebreak-sensitive renderer.
   * In some cases you may want to rely on editor/viewer soft wrapping instead, so this option allows you to opt out.
   * @default "preserve"
   */
  proseWrap: '"always" | "never" | "preserve"',
  /**
   * Include parentheses around a sole arrow function parameter.
   * @default "always"
   */
  arrowParens: '"avoid" | "always"',
  /**
   * Provide ability to support new languages to prettier.
   */
  plugins: type.string/* .or(T_Plugin) */.array(),
  /**
   * How to handle whitespaces in HTML.
   * @default "css"
   */
  htmlWhitespaceSensitivity: '"css" | "strict" | "ignore"',
  /**
   * Which end of line characters to apply.
   * @default "lf"
   */
  endOfLine: '"auto" | "lf" | "crlf" | "cr"',
  /**
   * Change when properties in objects are quoted.
   * @default "as-needed"
   */
  quoteProps: '"as-needed" | "consistent" | "preserve"',
  /**
   * Whether or not to indent the code inside <script> and <style> tags in Vue files.
   * @default false
   */
  vueIndentScriptAndStyle: 'boolean',
  /**
   * Control whether Prettier formats quoted code embedded in the file.
   * @default "auto"
   */
  embeddedLanguageFormatting: '"auto" | "off"',
  /**
   * Enforce single attribute per line in HTML, Vue and JSX.
   * @default false
   */
  singleAttributePerLine: 'boolean',
  /**
   * Use curious ternaries, with the question mark after the condition, instead
   * of on the same line as the consequent.
   * @default false
   */
  experimentalTernaries: 'boolean',
  /**
   * Put the `> ` of a multi-line JSX element at the end of the last line instead of being alone on the next line.
   * @default false
   * @deprecated use bracketSameLine instead
   */
  jsxBracketSameLine: 'boolean?',
}).partial()

const T_Config = type({
  /** Arbitrary additional values on an options object are always allowed. */
  '[string]': 'unknown',
  'overrides?': type({
    files: 'string | string[]',
    'excludeFiles?': 'string | string[]',
    'options?': T_Options,
  }).array(),
}).and(T_Options)

const pcm = T_Config.assert(importPCM())

/**
 * @typedef {import('prettier').Config} Config
 * @type {Config}
 */
const cfg = {
  ...pcm,
  overrides: [
    ...pcm.overrides ?? [],
    {
      files: ['*.json'],
      options: {
        trailingComma: 'none',
        bracketSameLine: true,
      },
    },
  ],

}

export default cfg
