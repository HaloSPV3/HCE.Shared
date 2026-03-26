/// <reference file="./semantic-release__git.d.ts">
// @ts-types="./semantic-release__git.d.ts"
import type { Options as GitOptions } from '@semantic-release/git';
/**
 * As specified at https://github.com/semantic-release/git#options
 * To use, assign or create an object with the same (but mutable) properties and deeply-copy to the object
 * @satisfies { GitOptions }
 */
export const DefaultOptions: {
  readonly assets: ['README.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'npm-shrinkwrap.json'];
  readonly message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}';
} = {
  assets: [
    'README.md',
    'CHANGELOG.md',
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
  ],
  message:
    'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
} as const satisfies GitOptions;
