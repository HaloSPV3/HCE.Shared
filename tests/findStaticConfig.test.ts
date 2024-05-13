import { ok } from 'node:assert';
import { describe, todo } from 'node:test';
import { findStaticConfig } from '@halospv3/hce.shared-config/findStaticConfig';

await describe('findStaticConfig', async () => {
    await todo('findStaticConfig returns path', () => {
        ok(typeof findStaticConfig === 'function');
    });
});