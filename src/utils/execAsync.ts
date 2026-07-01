/* eslint-disable jsdoc/no-defaults */
import { type, type Type } from 'arktype';
import { exec, type ExecException } from 'node:child_process';
import { constants } from 'node:os';
import { promisify } from 'node:util';
import { isError } from './isError.ts';

/**
 * A `promisify(exec)` wrapper to optionally assign the child process's STDERR as the {@link Error.prototype.cause}.
 * @see {@link promisify}, {@link exec}
 * @param command The command to run, with space-separated arguments.
 * @param [shouldSetStderrAsCause=false] If true and the child process's stderr is available, the thrown Error's {@link Error.prototype.cause} is assigned the stderr string.
 * @returns A promise of the child process's STDOUT and STDERR streams as strings
 * @throws {Error | ChildProcessSpawnException}
 */
export async function execAsync(command: string, shouldSetStderrAsCause = false): Promise<{
  stdout: string;
  stderr: string;
}> {
  try {
    return await promisify(exec)(command);
  }
  catch (error: unknown) {
    if (!isError(error))
      throw new Error(JSON.stringify(error), { cause: error });

    if (shouldSetStderrAsCause && 'stderr' in error && typeof error.stderr === 'string' && error.stderr !== '')
      error.cause ??= error.stderr;

    if ('stdout' in error && typeof error.stdout === 'string') {
      error.message
        += '\nSTDOUT:\n'
          + `  ${error.stdout.replaceAll('\n', '\n  ')}`;
    }
    if ('stderr' in error && typeof error.stderr === 'string') {
      error.message
        += '\nSTDERR:\n'
          + `  ${error.stderr.replaceAll('\n', '\n  ')}`;
    }

    throw new ChildProcessSpawnException(error.message, error);
  }
}

const T_ErrnoException: Type<NodeJS.ErrnoException> = type('Error').and({
  'errno?': 'number',
  'code?': 'string',
  'path?': 'string',
  'syscall?': 'string',
});

const T_ExecException: Type<
  Omit<ExecException, 'cmd' | 'signal'>
  & { signal?: ExecException['signal'] | null }
  & Partial<Pick<ExecException, 'cmd'>>
> = T_ErrnoException.omit('code').and({
  'cmd?': 'string',
  'code?': 'number | string',
  'killed?': 'boolean',
  'signal?': type((Object.keys(constants.signals) as NodeJS.Signals[])
    .map(v => type(`'${v}'`))
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((previous, current) => previous.or(current)))
    .or('null'),
  'stdout?': 'string',
  'stderr?': 'string',
});

// A class can only implement an identifier/qualified-name with optional type arguments. ts(2500)
type _ExecException = typeof T_ExecException.inferOut;

export class ChildProcessSpawnException extends Error implements _ExecException {
  cmd: typeof T_ExecException.inferOut.cmd;
  code: typeof T_ExecException.inferOut.code;
  errno?: typeof T_ExecException.inferOut.errno;
  killed: typeof T_ExecException.inferOut.killed;
  path?: typeof T_ExecException.inferOut.path;
  signal: typeof T_ExecException.inferOut.signal;
  stderr: typeof T_ExecException.inferOut.stderr;
  stdout: typeof T_ExecException.inferOut.stdout;
  syscall?: typeof T_ExecException.inferOut.syscall;

  constructor(
    message: Parameters<typeof Error>[0],
    options: typeof T_ExecException.inferIn,
  ) {
    options = T_ExecException.from(options);
    super(message, options);
    this.cmd = options.cmd;
    this.code = options.code;
    this.errno = options.errno;
    this.killed = options.killed;
    this.path = options.path;
    this.signal = options.signal;
    this.stderr = options.stderr;
    this.stdout = options.stdout;
    this.syscall = options.syscall;
  }
}
