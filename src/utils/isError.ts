import { isNativeError } from 'node:util/types';

/** @import 'typescript/lib/lib.esnext.error.d.ts' */

/**
 * Compatibility wrapper for ES2026 (Node.js 25)
 * {@link Error.isError Error.isError}
 * with failover to the deprecated {@link isNativeError utils.types.isNativeError}.
 * @param error A parameter which may be an Error.
 * @returns `true` if {@link error} is derived from or is sufficiently similar to {@link Error}. Else, `false`.
 * Note: DOMExceptions will result in `false`
 */
export function isError(error: unknown): error is Error {
  return 'isError' in Error && typeof Error.isError === 'function' && Error.isError.length > 0
    ? (Error.isError as typeof isError)(error)
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    : isNativeError(error);
}
