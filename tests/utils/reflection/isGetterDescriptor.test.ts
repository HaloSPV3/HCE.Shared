import { describe, it } from 'node:test';
import { isGetterDescriptor, type GetterDescriptor } from '../../../src/utils/reflection.js';
import { ok, strictEqual } from 'node:assert';

await describe('isGetterDescriptor', async () => {
  await it('returns true when `.get` is a function', () => {
    const tpd = { get: () => true } as TypedPropertyDescriptor<boolean>;
    const isGpd = isGetterDescriptor(tpd);
    strictEqual(isGpd, true);
    const gpd = isGetterDescriptor(tpd)
      ? tpd
      : (() => { throw new Error('never'); })();
    ok(gpd);
    type _ = typeof gpd extends GetterDescriptor<boolean> ? true : false;
    strictEqual(true as _, true);
  });
  await it('returns false when `.get` is not a function', () => {
    const tpd = { get: undefined } as TypedPropertyDescriptor<boolean>;
    const isGpd = isGetterDescriptor(tpd);
    strictEqual(isGpd, false);
    const gpd = isGetterDescriptor(tpd)
      ? tpd
      : new Error('never');
    ok(gpd);
    type _ = typeof gpd extends GetterDescriptor<boolean> ? true : false;
    strictEqual(false as _, false);
  });
});
