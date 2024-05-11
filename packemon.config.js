import babelConfig from "./babel.config.mjs"
import packageJson from "./package.json" with {type: "json"}

const deps = packageJson.dependencies;

/** 
 * @typedef {import("./packemon.config.d.ts").ConfigFile} ConfigFile
 * @type {ConfigFile}
 */
const config = {
    /** @type {ConfigFile["babelInput"]} */
    babelInput(config) {

        // plugins
        if (config.plugins) {
            config.plugins.push(babelConfig.plugins);
        }
        else config.plugins = [...babelConfig.plugins];

        // presets
        if ("presets" in babelConfig && Array.isArray(babelConfig.presets) && babelConfig.presets.length > 0 && typeof babelConfig.presets[0] === "string") {
            /**
             * @type {(string|[string,object])[]}
             */
            const presets = babelConfig.presets;
            if (config.presets)
                config.presets.push(babelConfig.presets);
            else config.presets = [...presets];
        }

        if (config.root)
            config.sourceRoot = "./src"

        // console.log(JSON.stringify(config, undefined, 2).replace(/"([^(")"]+)":/g, "$1:"));
    },
    // babelOutput(config, build) { },
    /** @type {ConfigFile["rollupInput"]} */
    rollupInput(config) {
        config.shimMissingExports = true;
        if (config.external === undefined || typeof config.external === "undefined")
            config.external = [];
        if (typeof config.external === "string" || typeof config.external === "object" && !Array.isArray(config.external))
            config.external = [config.external];
        if (Array.isArray(config.external)
            && !config.external.includes('resolve')
            && Object.keys(deps).includes("resolve")) {
            config.external.push('resolve');
        }
        else {
            /* Do nothing. It's a function. */
        }
    },
    // rollupOutput(config, build) { },
    swc: undefined,
    // swcInput(config) { },
    // swcOutput(config, build) { }
}

export default config;