import { MSBuildProjectProperties } from '@halospv3/hce.shared-config/dotnet/MSBuildProjectProperties';
import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('MSBuildProjectProperties', async () => {
    await it('exists', () => {
        ok(MSBuildProjectProperties);
    })
});
