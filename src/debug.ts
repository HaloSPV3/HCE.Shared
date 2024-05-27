import debug from 'debug';

const _debug = debug('@halospv3/hce.shared-config');

if (process.argv.some(v => v.includes('--debug')) || debug.enabled('*')) {
    debug.enable(_debug.namespace);
}

export default _debug;