import { Options } from 'semantic-release';
import HceShared, { deserializeAndValidate } from '../index.mjs';

const timeout = 30000;

test('default', async () => {
    commonChecks(await HceShared());
}, timeout)

test('deserializeAndValidate', async () => {
    commonChecks(await deserializeAndValidate());
}, timeout);

function commonChecks(options: Options) {
    expect(options).toBeDefined();
    expect(options.preset).toBeDefined();
    expect(options.preset).toBe("conventionalcommits");
    expect(options.branches).toBeDefined();
    expect(options.branches).toStrictEqual(["main", { name: "develop", channel: "develop", prerelease: true }]);
}
