import { get,
  config as loadDotenv,
  type DotenvConfigOptions,
  type GetOptions,
} from '@dotenvx/dotenvx';
import { env } from 'node:process';

/** `get` can return `undefined`. It can also return a `Record`, but that's internal. */
type Get = (key: string, options?: GetOptions) => string | undefined;

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
 * Else, try to get it from the nearest .env file.
 * If NOT found, return `undefined`
 * @param envVar The environment variable to lookup.
 * @param [options] Options to pass to {@link get}
 * @returns The string value of the environment variable or `undefined`.
 * `undefined` may be returned when the variable is undefined or its string is
 * empty, whitespace, or appears to have been converted from `null` or
 * `undefined`.
 */
export function getEnvVarValue(envVar: string, options?: GetOptions): string | undefined {
  options ??= { ignore: ['MISSING_KEY', 'MISSING_ENV_FILE'] };
  let value = env[envVar];
  const x = (get as Get)(envVar, options);
  if (typeof x === 'string')
    value = x;
  // I hate this. Why is undefined converted to a string?
  return value === '' || value === 'undefined'
    ? undefined
    : value;
}
