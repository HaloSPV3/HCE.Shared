import * as fs from 'fs'
import Ajv, { type SchemaObject } from 'ajv'
import { URL } from 'url';
import fetch from 'node-fetch';

export default fetchSchema;
export async function fetchSchema() {
    return await loadRemoteSchemaFile('https://json.schemastore.org/semantic-release.json');
}

export async function loadLocalSchemaFile(fileFullPath: fs.PathLike) {
    return fs.readFileSync(fileFullPath, 'utf8')
}

export async function loadRemoteSchemaFile(url: string): Promise<Ajv.SchemaObject> {
    const res = await fetch(new URL(url));
    if (!res.ok) {
        Promise.reject()
    }
    return await res.json() as SchemaObject;
}
