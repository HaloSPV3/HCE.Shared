declare module 'semantic-release/lib/get-config.js' {
    import { GlobalConfig, Options, PluginSpec } from 'semantic-release'
    export default async function (context: Context, cliOptions: string | string[] | unknown): Promise<config>;
    export type config = {
        /**
         * semantic-release options -OR- semantic-release options after normalization and defaults have been applied.
         *
         * Can be used to set any core option or plugin options.
         * Each option will take precedence over options configured in the
         * configuration file and shareable configurations.
         */
        options: Options | GlobalConfig,

        /**
         * May override or extend { options#plugins }.
         * Define the list of plugins to use. Plugins will run in series, in
         * the order defined, for each [step](https://semantic-release.gitbook.io/semantic-release/#release-steps)
         * if they implement it.
         *
         * Plugins configuration can be defined by wrapping the name and an
         * options object in an array.
         *
         * See [Plugins configuration](https://semantic-release.gitbook.io/semantic-release/usage/plugins#plugins)
         * for more details.
         *
         * Default: `[
         *     "@semantic-release/commit-analyzer",
         *     "@semantic-release/release-notes-generator",
         *     "@semantic-release/npm",
         *     "@semantic-release/github"
         * ]`
         */
        plugins: ReadonlyArray<PluginSpec>
    }
    import { Options as execaOptions } from 'semantic-release/node_modules/execa/index.js'
    import signale from 'signale'
    import getLogger from 'semantic-release/lib/get-logger.js'
    import envCi from 'env-ci'
    export interface Context {
        /** Current working directory of the child process.
         * -OR-
         * The path to a semantic-release configuration file.
         * Cosmiconfig checks if cwd resolves to a config file path.
         * It can't work with `file://` file paths. Convert the path via fileURLToPath(url: string | URL).
         *
         * @default process.cwd()
         */
        cwd: string = process.cwd();

        /** Environment key-value pairs. Extends automatically from `process.env`.
        @default process.env
        */
        env: NodeJS.ProcessEnv = process.env;
        envCi: envCi.CiEnv = envCi({ env: process.env, cwd: process.cwd() });
        /** The shared logger instance of semantic release. */
        logger: signale.Signale<"error" | "success" | "log"> = getLogger({ stdout: process.stdout, stderr: process.stderr });
        stderr: typeof process.stderr = process.stderr;
        stdout: typeof process.stdout = process.stdout;
    };
}
