import { describe, it } from 'node:test';
import {
  tBooleanString,
  tEmptyOrBooleanString,
} from '../../src/utils/miscTypes.js';
import { ok } from 'node:assert/strict';

await describe('tBooleanString', async () => {
  await it('matches literal string "true"', () => {
    tBooleanString.assert('true');
  });
  await it('matches literal string "false"', () => {
    tBooleanString.assert('false');
  });
  await it('does not match boolean True', () => {
    ok(!tBooleanString.allows(true));
  });
  await it('does not match boolean False', () => {
    ok(!tBooleanString.allows(false));
  });
});

await describe('tEmptyOrBooleanString', async () => {
  await it('matches literal string "true"', () => {
    tEmptyOrBooleanString.assert('true');
  });
  await it('matches literal string "false"', () => {
    tEmptyOrBooleanString.assert('false');
  });
  await it('matches empty string', () => {
    tEmptyOrBooleanString.assert('');
  });
  await it('does not match boolean True', () => {
    ok(!tEmptyOrBooleanString.allows(true));
  });
  await it('does not match boolean False', () => {
    ok(!tEmptyOrBooleanString.allows(false));
  });
});
