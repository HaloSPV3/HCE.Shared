import { existsSync } from 'fs'
import { Options } from 'semantic-release';
import { readFile } from 'fs/promises';
import jsYaml from 'js-yaml'
import path from 'path';
import { fileURLToPath } from 'url';
import debug, { Debugger, } from 'debug';

const DEBUG: Debugger = debug("HCE.Shared")

/**
 * Runs HCE.Shared and returns a Promise that resolves to
 * a semantic-release "shareable configuration" object.
 * @type {Options}.
 * @async
 */
export default async function (): Promise<Options> {
    return await deserializeAndValidate(); // faster, but results may differ from expectations if semantic-release or its deps change.
}

/** OPTION A: deserialize via 'require-yml' and export.
 * Fewer steps to implement.
 */
export async function deserializeAndValidate() {
    const ajv = new (await import('ajv')).default.default();
    const ajvDraft4 = new (await import('ajv-draft-04')).default.default();
    const schema = await (await import('./fetchSchema.mjs')).default();
    const cfg = jsYaml.load(await readFile(findStaticConfig(), { encoding: 'utf8' }));
    const configIsValid =
        schema.$schema == 'http://json-schema.org/draft-04/schema#' ?
            ajvDraft4.validate(schema, cfg) :
            ajv.validate(schema, cfg);

    if (!configIsValid) {
        throw "Object deserialized from HCE.Shared's \".releaserc.yml\" config file is invalid according to schema fetched from https://json.schemastore.org/semantic-release.json. Did the schema change or was the config modified?";
    }

    DEBUG("## OptionA ##\n" + jsYaml.dump(cfg));
    return cfg as Options;
}

function findStaticConfig(): string {
    const glob = "static/.releaserc.yml";
    var dirPath = fileURLToPath(path.dirname(import.meta.url));
    var combinedPath = path.join(dirPath, glob);

    while (!existsSync(combinedPath)) {

        /* file:// + dirname behavior on Windows. 'root' is empty when 'file://' is present.
         * file:///C:/Repos
         * file:///C:
         * file://
         * .
         */

        //DEBUG.log(dirPath);
        //DEBUG.log(combinedPath.href);

        /** Throw if we reached root. */
        if (path.dirname(dirPath) == '')
            throw `Failed to get full path for HCE.Shared's shared configuration. HCE.Shared recursively searched parent directories for '${glob}' starting from '${path.dirname(import.meta.url)}'`

        dirPath = path.dirname(dirPath);
        combinedPath = path.join(dirPath, glob);
    }

    return combinedPath;
}
