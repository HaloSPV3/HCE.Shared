import { existsSync } from 'fs'
import { Options } from 'semantic-release';
import { readFile } from 'fs/promises';
import getConfig, { Context, config } from 'semantic-release/lib/get-config.js';
import getLogger from 'semantic-release/lib/get-logger.js'
import jsYaml from 'js-yaml'
import path from 'path';
import { fileURLToPath } from 'url';
import debug, { Debugger, } from 'debug';
import envCi from 'env-ci';

const DEBUG: Debugger = debug("HCE.Shared")

/**
 * Runs HCE.Shared and returns a Promise that resolves to
 * a semantic-release "shareable configuration" object.
 * @type {Options}.
 * @async
 */
export default async function (): Promise<Options> {
    try {
        return await deserializeAndValidate(); // faster, but results may differ from expectations if semantic-release or its deps change.
    }
    catch (e) {
        console.warn(e);
        return await faithfulLoadAndFulfill();
    }
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

/** OPTION B:
 * Call semantic-release's get-config,
 * deserialize via 'cosmiconfig',
 * merge shareable configs specified by `extends`,
 * fill remaining config properties with default values,
 * and export the returned shareable config as this module's default export.
 *
 * Many more steps, but utilizes semantic-release's implementation
 * to ensure compatibility.
 */
export async function faithfulLoadAndFulfill() {
    const cfg: config = (await getConfig(context, ""));
    DEBUG("## OptionB ##\n" + jsYaml.dump(cfg.options));
    return cfg.options;
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

const context: Context = {
    /** Current working directory of the child process.
     * -OR-
     * The path to a semantic-release configuration file.
     *
     * @default process.cwd()
     */
    cwd: findStaticConfig() ?? process.cwd(),
    /** Environment key-value pairs. Extends automatically from `process.env`.
     *
     * @default process.env
     */
    env: process.env as { [key: string]: string },
    envCi: envCi({ env: process.env, cwd: process.cwd() }),
    logger: getLogger({
        stdout: process.stdout,
        stderr: process.stderr
    }),
    stderr: process.stderr,
    stdout: process.stdout,

}