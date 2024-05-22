import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { findStaticConfig } from '@halospv3/hce.shared-config/findStaticConfig';
import { existsSync } from 'node:fs';

await describe('findStaticConfig', async () => {
    await it('findStaticConfig returns path', () => {
        ok(typeof findStaticConfig === 'function');
        const path = findStaticConfig();
        strictEqual(typeof path, "string");
        ok(existsSync(path));
    });
});