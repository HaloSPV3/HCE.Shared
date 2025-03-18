import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * A promisify(exec) wrapper to optionally assign the child process's STDERR as the {@link Error.prototype.cause}.
 *
 * @see {@link promisify}, {@link exec}
 *
 * @param command The command to run, with space-separated arguments.
 * @param [setStdErrAsCause=false] If true and the child process's stderr is available, the thrown Error's {@link Error.prototype.cause} is assigned the stderr string.
 * @returns A promise of the child process's STDOUT and STDERR streams as strings
 * @throws {Error & Awaited<ReturnType<typeof execAsync>>}
 */
export async function execAsync(command: string, setStdErrAsCause = false) {
  return await promisify(exec)(command).catch((err: unknown) => {
    if (!(err instanceof Error)) throw new Error(String(err));

    if (setStdErrAsCause && 'stderr' in err && typeof err.stderr === 'string')
      err.cause = err.stderr;

    throw err;
  });
}
