import { type } from 'arktype';
import { exec, type ExecException } from 'child_process';
import { constants } from 'os';
import { promisify } from 'util';

/**
 * A promisify(exec) wrapper to optionally assign the child process's STDERR as the {@link Error.prototype.cause}.
 *
 * @see {@link promisify}, {@link exec}
 *
 * @param command The command to run, with space-separated arguments.
 * @param [setStdErrAsCause=false] If true and the child process's stderr is available, the thrown Error's {@link Error.prototype.cause} is assigned the stderr string.
 * @returns A promise of the child process's STDOUT and STDERR streams as strings
 * @throws {Error | ExecException | ChildProcessSpawnException}
 */
export async function execAsync(command: string, setStdErrAsCause = false) {
  return await promisify(exec)(command).catch((err: unknown): never => {
    if (!(err instanceof Error))
      throw new Error(JSON.stringify(err));

    if (setStdErrAsCause && 'stderr' in err && typeof err.stderr === 'string')
      err.cause ??= err.stderr;

    throw new ChildProcessSpawnException(err.message, { ...err as ExecException });
  });
}

const T_ExecException = type('Error').and({
  'cmd?': 'string | null',
  'killed?': 'boolean | null',
  'code?': 'number | null',
  'signal?': (Object.keys(constants.signals) as NodeJS.Signals[])
    .map(v => type(`'${v}'`))
    .reduce((previous, current) => previous.or(current)),
  'stdout?': 'string',
  'stderr?': 'string',
});

type _ExecException = typeof T_ExecException.inferOut;

export class ChildProcessSpawnException extends Error implements _ExecException {
  constructor(
    message: Parameters<typeof Error>[0],
    options: ErrorOptions & typeof T_ExecException.inferIn,
  ) {
    options = T_ExecException.from(options);
    super(message, options);
    this.cmd = options.cmd;
    this.code = options.code;
    this.killed = options.killed;
    this.signal = options.signal;
    this.stderr = options.stderr;
    this.stdout = options.stdout;
  }

  cmd: typeof T_ExecException.inferOut.cmd;
  code: typeof T_ExecException.inferOut.code;
  killed: typeof T_ExecException.inferOut.killed;
  signal: typeof T_ExecException.inferOut.signal;
  stderr: typeof T_ExecException.inferOut.stderr;
  stdout: typeof T_ExecException.inferOut.stdout;
}
