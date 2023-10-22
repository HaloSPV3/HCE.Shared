import {
  deepStrictEqual,
  notStrictEqual,
  ok,
  strictEqual,
} from "node:assert/strict";
import { test } from "node:test";
import { URL } from "node:url";
import Ajv from "ajv";
import { type SchemaObject } from "ajv";
import AjvDraft04 from "ajv-draft-04";
import jsYaml from "js-yaml";
import fetch from "node-fetch";
import type { Options } from "semantic-release";
import HceSharedConfig from "@halospv3/hce.shared-config";

async function loadRemoteSchemaFile(url: string): Promise<SchemaObject> {
  const res = await fetch(new URL(url));
  if (!res.ok) {
    throw new Error(`'${res.status}': '${res.statusText}'`);
  }
  return res.json() as SchemaObject;
}

await test("HCE.Shared module returns semantic-release shareable configuration (Options object)", async (t) => {
  const options = HceSharedConfig as Options;
  const schema = await loadRemoteSchemaFile(
    "https://json.schemastore.org/semantic-release.json",
  );
  await t.test("options validated by schema?", () => {
    ok(
      schema.$schema === "http://json-schema.org/draft-04/schema#"
        ? new AjvDraft04().validate(schema, options)
        : new Ajv().validate(schema, options),
      'Object deserialized from HCE.Shared\'s ".releaserc.yml" config file is invalid according to schema fetched from https://json.schemastore.org/semantic-release.json. Did the schema change or was the config modified?',
    );
    console.log(jsYaml.dump(options));
  });
  await t.test(
    "options is defined",
    () => void notStrictEqual(options, undefined),
  );
  await t.test(
    "options.preset is conventionalcommits",
    () => void strictEqual(options.preset, "conventionalcommits"),
  );
  await t.test(
    "options.branches is mainline-main, prerelease-develop",
    () =>
      void deepStrictEqual(options.branches, [
        "main",
        {
          name: "develop",
          channel: "develop",
          prerelease: true,
        },
      ]),
  );
});
