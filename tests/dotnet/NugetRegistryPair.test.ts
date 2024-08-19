import { ok } from 'node:assert'
import { deepStrictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as mod from '../../src/dotnet/NugetRegistryPair.js'
import { NugetRegistryPair as NRP, nugetDefault } from '../../src/dotnet/NugetRegistryPair.js'
import { ArkError } from 'arktype'

await describe('nugetDefault', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(c00.name in mod, true)
  })
  await it('has expected value', () => {
    deepStrictEqual(
      nugetDefault,
      new NRP('NUGET_TOKEN', 'https://api.nuget.org/v3/index.json'),
    )
  })
})

await describe('NugetRegistryPair', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(NRP.name, c00.name)
  })
  await it('is an representation of its constructor\' args', () => {
    const tokenEnvVar = 'arg0'
    const url = 'arg1'
    const user = 'arg2'
    const pair = new NRP(tokenEnvVar, url, user)
    deepStrictEqual(
      { ...pair },
      { tokenEnvVar, url, user },
    )
  })
  await it('requires tokenEnvVar', () => {
    try {
      Reflect.getOwnPropertyDescriptor(
        new NRP(undefined as unknown as string, '', undefined),
        'tokenEnvVar',
      )
    }
    catch (err) {
      ok(err instanceof AggregateError)
      ok(err.errors[0] instanceof ArkError)
      deepStrictEqual(err.message, 'must be a string (was undefined)')
    }
  })
  await it('does not require "user"', () => {
    const user = Object.getOwnPropertyDescriptor(new NRP('', ''), 'user')
    deepStrictEqual(
      user,
      {
        value: undefined,
        writable: true,
        enumerable: true,
        configurable: true,
      },
    )
  })
})
