import HceShared, { deserializeAndValidate, faithfulLoadAndFulfill } from '../index.mjs';

const timeout = 30000;

test('default', async () => {
    commonChecks(await HceShared());
}, timeout)

test('deserializeAndValidate', async () => {
    commonChecks(await deserializeAndValidate());
}, timeout);

test('faithfulLoadAndFulfill', async () => {
    commonChecks(await faithfulLoadAndFulfill())
}, timeout);

function commonChecks(options) {
    expect(options).toBeDefined();
    expect(options.preset).toBeDefined();
    expect(options.preset).toBe("conventionalcommits");
    expect(options.branches).toBeDefined();
    expect(options.branches).toStrictEqual([
        "main",
        {
            name: "develop",
            channel: "develop",
            prerelease: true
        }
    ]);
}
