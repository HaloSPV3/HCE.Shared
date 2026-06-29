import createDebugger from 'debug';
import * as process from 'node:process';

interface Debugger {
  (formatter: unknown, ...arguments_: unknown[]): void;
  color: string;
  diff: number;
  enabled: boolean;
  namespace: string;
  destroy: () => boolean;
  extend: (namespace: string, delimiter?: string) => Debugger;
}

// note: @types/debug is incorrect. There is no .log function!
// Omit<T,K> breaks the Function typing.
const _debug: Debugger = createDebugger('@halospv3/hce.shared-config');

if (process.argv.some(v => v.includes('--debug')) || createDebugger.enabled('@halospv3/hce.shared-config')) {
  createDebugger.enable(_debug.namespace);
}

export default _debug;
