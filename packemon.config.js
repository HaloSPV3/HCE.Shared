import babelConfig from "./babel.config.mjs"

/** 
 * @typedef {import("./packemon.config.d.ts").ConfigFile} ConfigFile
 * @type {ConfigFile}
 */
export default {
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
    }
};