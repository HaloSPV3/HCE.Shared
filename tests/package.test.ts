import { describe, it } from 'node:test'

import { deepStrictEqual, notStrictEqual } from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import packageJson from '../package.json' with { type: 'json' }
const { packemon } = packageJson
// import { isMainThread, Worker } from "node:worker_threads";

// #region PackemonTypes
type InputMap = Record<string, string>
interface PackemonPackageFeatures {
  cjsTypesCompat?: boolean
  helpers?: 'bundled' | 'external' | 'inline' | 'runtime'
  swc?: boolean
}
type CommonFormat = 'lib'
type BrowserFormat =
  | CommonFormat
  // ECMAScript modules with ".js" file extension
  | 'esm'
  // Universal Module Definition with ".js" file extension
  | 'umd'
type NodeFormat =
  | CommonFormat
  /* CommonJS modules with ".cjs" file extension */
  | 'cjs'
  /* ECMAScript modules with ".mjs" file extension */
  | 'mjs'
type Format = BrowserFormat | NodeFormat
type Platform = 'browser' | 'electron' | 'native' | 'node'

interface PackemonPackageConfig {
  api?: 'private' | 'public'
  bundle?: boolean
  externals?: string[] | string
  features?: PackemonPackageFeatures
  format?: Format | Format[]
  inputs?: InputMap
  namespace?: string
  platform?: Platform | Platform[]
  support?: |
  // Latest version
  'current' |
  // Next/future version
  'experimental' |
  // Unsupported version
  'legacy' |
  // Oldest version still supported
  'stable'
}

// #endregion PackemonTypes

await describe('package.json', async () => {
  // #region Types
  interface Entry {
    name: string
    source: string
  };
  interface Result {
    action: 'require' | 'import'
    entry: Entry
    validity: Error | boolean
  };

  // #endregion Types

  const require = createRequire(import.meta.url)
  function tryCanAction(action: Result['action'], entry: Result['entry']) {
    const result = { action, entry, validity: false } as Result
    try {
      const id = `@halospv3/hce.shared-config/${result.entry.name}`
      let verb
      if (result.action === 'import') {
        /* const resolvedId = */import.meta.resolve(id)
        verb = 'await import'
      }
      else /** preResult.action === "require" */ {
        /* const resolvedId = */require.resolve(id)
        verb = 'require'
      }

      // const worker = new Worker(`const def = ${action}('${id})`);
      const cp = spawnSync('node', ['-', `${verb}('${id}');.exit`], { encoding: 'utf8' })
      if (cp.error ?? (cp.stderr.length > 0 && cp.stderr.replaceAll('\r\n', '') !== 'Debugger attached.Waiting for the debugger to disconnect...'))
        throw cp.error ?? new Error(cp.stderr)

      result.validity = true
      return result
    }
    catch (error) {
      if (error instanceof Error)
        result.validity = error
      else if (typeof error === 'string')
        result.validity = new Error(error)
      else
        result.validity = new Error(String(error))
      return result
    }
  }

  const nameof_expectedEsm = 'expectedEsm'
  const expectedEsm: string[] = [
    'CaseInsensitiveMap',
    'commitlintConfig',
    'envUtils',
    'eslintConfig',
    'index',
    'semanticReleaseConfig',
    'semanticReleaseConfigDotnet',
    'setupGitPluginSpec',
  ]

  // #region Arrays
  const packemonArray = (Array.isArray(packemon) ? packemon : [packemon]) as PackemonPackageConfig[]
  const packemonMjs = packemonArray.find(v => v.format === 'mjs' || true === v.format?.includes('mjs') || (v.format === undefined && v.platform === 'node'))
  const results: Result[] = []
  if (packemonMjs?.inputs) {
    results.push(
      ...Object.entries(packemonMjs.inputs)
        .map(entry =>
          tryCanAction('import', { name: entry[0], source: entry[1] }),
        ),
    )
  }

  const importedEsm: string[] = []
  for (const result of results) {
    // result.validity = await result.validity;
    if (!(result.validity instanceof Error)) {
      switch (result.action) {
        case 'import':
          importedEsm.push(result.entry.name)
          break
        default:
          throw new Error(`unexpected validation action '${result.action}'.`)
      }
    }
  }

  // #endregion Arrays

  await it('...exposes no modules which fail to load', () => {
    interface ErrorResult extends Omit<Result, 'validity'> { validity: Error }
    const errored = results.filter(v => v.validity instanceof Error) as ErrorResult[]
    errored.forEach((v) => {
      console.debug(v)
    })
    deepStrictEqual(
      errored,
      [],
      errored.map(
        result =>
          `Unable to ${result.action} ${result.entry.source}. Reason:\n${result.validity.stack}`,
      ).join('\n'),
    )
  })

  await it('...is expected to expose ESM, but was not configured to do so', () => {
    if (expectedEsm.length > 0) {
      notStrictEqual(
        packemonMjs?.inputs,
        undefined,
        `packemon was not configured for ESM, but ESM modules were expected! Comment out entries in ${nameof_expectedEsm}.`,
      )
    }
  })

  const missingEsm = expectedEsm.filter(expected => !importedEsm.includes(expected))
  const unexpectedEsm = importedEsm.filter(imported => !expectedEsm.includes(imported))

  await it('...exposes all expected ESM modules', () => {
    deepStrictEqual(
      missingEsm,
      [],
      `One or more input modules (${missingEsm.map(v => `"${v}"`).join(', ')}) were not imported! Is this a breaking change?`)
  })
  await it('...exposes no unexpected ESM modules', () => {
    deepStrictEqual(
      unexpectedEsm,
      [],
      `One or more exposed modules were imported, but were not found in ${nameof_expectedEsm}. `
      + `Add the modules' names (${unexpectedEsm.map(v => `"${v}"`).join(', ')}) to './tests/package.test.ts#${nameof_expectedEsm}' to ensure they are not accidentally removed later!`,
    )
  })
})
