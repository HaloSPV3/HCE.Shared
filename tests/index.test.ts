import HceSharedConfig from '@halospv3/hce.shared-config';
import Ajv, { type SchemaObject } from 'ajv';
import AjvDraft04 from 'ajv-draft-04';
import fetch from 'node-fetch';
import {
	deepStrictEqual,
	notStrictEqual,
	ok,
	strictEqual
} from 'node:assert/strict';
import { describe, test } from 'node:test';
import { URL } from 'node:url';
import type { Options } from 'semantic-release';

async function loadRemoteSchemaFile(url: string): Promise<SchemaObject> {
	const res = await fetch(new URL(url));
	if (!res.ok) {
		throw new Error(`'${res.status.toString()}': '${res.statusText}'`);
	}
	return res.json() as SchemaObject;
}

const options: Options = HceSharedConfig;

await describe('index', async () => {
	await test('default export from index: semantic-release options', async () => {
		await test('options validated by schema?', async () => {
			const schema = await loadRemoteSchemaFile('https://json.schemastore.org/semantic-release.json');
			ok(
				schema.$schema === 'http://json-schema.org/draft-04/schema#'
					? new AjvDraft04.default().validate(schema, options)
					: new Ajv.default().validate(schema, options),
				'Object deserialized from HCE.Shared\'s ".releaserc.yml" config file is invalid according to schema fetched from https://json.schemastore.org/semantic-release.json. Did the schema change or was the config modified?',
			);
		});

		await test('options is defined', () => {
			notStrictEqual(options, undefined)
		});

		await test('options.preset is conventionalcommits', () => {
			strictEqual(options.preset, 'conventionalcommits')
		});

		await test('options.branches is mainline-main, prerelease-develop', () => {
			deepStrictEqual(options.branches, [
				'main',
				{
					name: 'develop',
					channel: 'develop',
					prerelease: true,
				},
			]);
		});
	});
});