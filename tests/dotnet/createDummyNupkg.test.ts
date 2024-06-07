import { createDummyNupkg } from '@halospv3/hce.shared-config/dotnet/createDummyNupkg';
import { strictEqual } from 'node:assert';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';

await describe('createDummyNupkg', () => {
    const dummyNupkgPath = createDummyNupkg();

    it('returns a path that exists', () => {
        strictEqual(existsSync(dummyNupkgPath), true);
    })
});