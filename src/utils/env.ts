import { config as loadDotenv, type DotenvConfigOptions } from 'dotenv';
import { env } from 'node:process';

/**
 * A thin wrapper for {@link loadDotenv}. Loads a .env file from {@link process.cwd()} with the given options (or defaults), returns the new value of {@link process.env} with optional overrides.
 * @param [dotenvOptions] An optional {@link DotenvConfigOptions} object to pass to {@link loadDotenv}.
 * @param [overrides] If provided, this {@link NodeJS.ProcessEnv} object is merged into the return value, overriding existing properties where overlap occurs.
 * @returns A {@link NodeJS.ProcessEnv} object whose properties are variables loaded from the
 * process environment, the nearest .env file, and {@link overrides} (if provided). Where
 * overlap occurs, the later source takes priority.
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
 * @param envVar The environment variable to lookup.
 * @param [options] Options to pass to {@link loadDotenv}
 * @returns The string value of the environment variable or `undefined`
 */
export function getEnvVarValue(envVar: string, options?: Parameters<typeof loadDotenv>[0]): string | undefined {
  const value = env[envVar] ?? loadDotenv(options);
  if (typeof value === 'string')
    return value;
  if (value.parsed?.[envVar] !== undefined)
    return value.parsed[envVar];

  return undefined;
}
