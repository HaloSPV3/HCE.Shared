import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import _ajv from 'ajv'
import _ajv04 from 'ajv'
import jsYaml from 'js-yaml'
import type { Options } from 'semantic-release';

function findStaticConfig(): string {
    const glob = "static/.releaserc.yml";
    let dirPath = fileURLToPath(path.dirname(import.meta.url));
    let combinedPath = path.join(dirPath, glob);

    while (!existsSync(combinedPath)) {

        /* file:// + dirname behavior on Windows. 'root' is empty when 'file://' is present.
         * file:///C:/Repos
         * file:///C:
         * file://
         * .
         */
        // DEBUG.log(dirPath);
        // DEBUG.log(combinedPath.href);
        /** Throw if we reached root. */
        if (path.dirname(dirPath) === '')
            throw new Error(`Failed to get full path for HCE.Shared's shared configuration. HCE.Shared recursively searched parent directories for '${glob}' starting from '${path.dirname(import.meta.url)}'`);
        dirPath = path.dirname(dirPath);
        combinedPath = path.join(dirPath, glob);
    }
    return combinedPath;
}

/**
 * Runs HCE.Shared and returns a Promise that resolves to
 * a semantic-release "shareable configuration" object.
 * @type {Options}.
 */
export default (): Options => jsYaml.load(readFileSync(findStaticConfig(), { encoding: 'utf8' })) as Options
