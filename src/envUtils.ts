import { config as loadDotenv, type DotenvConfigOptions } from 'dotenv'
import { env } from 'node:process'

/**
 * Load a .env file from the CWD with the given options (or defaults), returns the new value of process.env
 * @param dotenvOptions
 * @param overrides
 * @returns
 */
export function getEnv(dotenvOptions?: DotenvConfigOptions, overrides?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  loadDotenv(dotenvOptions)

  if (overrides)
    Object.assign(env, overrides)

  return env
}

/**
 * Get the value from the given env var. If undefined, load .env from CWD and try again or return undefined. If found by dotenv, the variable will be loaded into process.env.
 * @param envVar
 * @returns
 */
export function getEnvVarValue(envVar: string): string | undefined {
  let value = env[envVar]
  if (!value) {
    try {
      loadDotenv()
    }
    catch (err) {
      console.error(String(err))
    }
    value = env[envVar]
  }
  return value
}
