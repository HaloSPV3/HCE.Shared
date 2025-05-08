import { config as loadDotenv, type DotenvConfigOptions } from 'dotenv';
import { env } from 'node:process';

/**
 * Load a .env file from the CWD with the given options (or defaults), returns the new value of process.env
 * @param dotenvOptions
 * @param overrides
 * @returns
 */
export function getEnv(dotenvOptions?: DotenvConfigOptions, overrides?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  loadDotenv(dotenvOptions);

  if (overrides)
    Object.assign(env, overrides);

  return env;
}

/**
 * Get the value from the given env var in the current process or nearby .env file.
 * If found in process environment, its value is returned.
 * Else, load nearest .env file into the process environment and try again.
 * If NOT found, console.warn and return `undefined`
 *
 * @export
 * @param {string} envVar
 * @param {?Parameters<typeof loadDotenv>[0]} [options]
 * @returns {(string | undefined)}
 */
export function getEnvVarValue(envVar: string, options?: Parameters<typeof loadDotenv>[0]): string | undefined {
  const value = env[envVar] ?? loadDotenv(options);
  if (typeof value === 'string')
    return value;
  if (value.parsed?.[envVar] !== undefined)
    return value.parsed[envVar];

  const err = value.error === undefined
    ? ''
    : `\n${value.error.stack ?? value.error.message}`;
  console.warn(`Unable to find ${envVar} in process environment or in a .env file.` + err);

  return undefined;
}
