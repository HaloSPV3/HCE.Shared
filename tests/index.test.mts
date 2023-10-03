import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from "node:test";
import HceShared from '../src/index';

describe('HCE.Shared module returns semantic-release shareable configuration (Options object)',
    async () => await commonChecks(HceShared())
)

import Ajv from 'ajv';
import AjvDraft04 from 'ajv-draft-04';
import jsYaml from 'js-yaml';
import type { Options } from 'semantic-release';
async function commonChecks(options: Options) {
    const schema = await loadRemoteSchemaFile('https://json.schemastore.org/semantic-release.json');
    ok(
        schema.$schema === 'http://json-schema.org/draft-04/schema#' ?
            new AjvDraft04().validate(schema, options) :
            new Ajv().validate(schema, options)
        , "Object deserialized from HCE.Shared's \".releaserc.yml\" config file is invalid according to schema fetched from https://json.schemastore.org/semantic-release.json. Did the schema change or was the config modified?");
    console.log(jsYaml.dump(options));
    it("options is defined", () => notStrictEqual(options, undefined));
    it("options.preset is conventionalcommits", () => strictEqual(options.preset, "conventionalcommits"));
    it("options.branches is defined",
        () => deepStrictEqual(
            options.branches,
            [
                "main",
                {
                    name: "develop",
                    channel: "develop",
                    prerelease: true
                }
            ]
        )
    )
}


import { type SchemaObject } from 'ajv';
import fetch from 'node-fetch';
import { URL } from 'url';
//import * as fs from 'fs';
//function loadLocalSchemaFile(fileFullPath: fs.PathLike) {
//    return fs.readFileSync(fileFullPath, 'utf8')
//}

async function loadRemoteSchemaFile(url: string): Promise<SchemaObject> {
    const res = await fetch(new URL(url));
    if (!res.ok) {
        Promise.reject(`'${res.status}': '${res.statusText}'`)
    }
    return await res.json() as SchemaObject;
}
