import debug from 'debug';

const _debug: ReturnType<typeof debug> = debug('@halospv3/hce.shared-config');

if (process.argv.some(v => v.includes('--debug')) || debug.enabled('@halospv3/hce.shared-config')) {
  debug.enable(_debug.namespace);
}

export default _debug;
