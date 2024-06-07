import { findStaticConfig } from '@halospv3/hce.shared-config/findStaticConfig';
import { ok, strictEqual } from 'node:assert';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';

await describe('findStaticConfig', async () => {
    await it('findStaticConfig returns path', () => {
        ok(typeof findStaticConfig === 'function');
        const path = findStaticConfig();
        strictEqual(typeof path, "string");
        ok(existsSync(path));
    });
});