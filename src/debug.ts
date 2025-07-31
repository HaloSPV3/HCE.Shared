// note: @types/debug is incorrect. There is no .log function!
import createDebugger, { type Debugger } from 'debug';

const _debug = createDebugger('@halospv3/hce.shared-config') as Debugger & { log: never };

if (process.argv.some(v => v.includes('--debug')) || createDebugger.enabled('@halospv3/hce.shared-config')) {
  createDebugger.enable(_debug.namespace);
}

export default _debug;
