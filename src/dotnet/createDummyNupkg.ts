/// <reference lib="ES2021.string" />
import 'core-js/stable/string/replace-all';
import { execSync, type ExecSyncOptionsWithStringEncoding } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { dirSync } from 'tmp';

export function createDummyNupkg(): string {
    const dirResult = dirSync({ unsafeCleanup: true });
    const dummyPkgFullPath: string = join(dirResult.name, 'DUMMY.1.0.0.nupkg');

    // delete old and possibly-poisoned nupkg
    if (existsSync(dummyPkgFullPath))
        unlinkSync(dummyPkgFullPath);

    const options: ExecSyncOptionsWithStringEncoding = {
        cwd: dirResult.name,
        encoding: 'utf8'
    };

    execSync('dotnet new console --name DUMMY', options);
    const packOut = execSync(`dotnet pack DUMMY --configuration Release --output ${dirname(dummyPkgFullPath)}`, options);

    const createdLine = packOut.replaceAll('\r', '')
        .split('\n')
        .find(line => line.includes('Successfully created package'))?.trim();

    if (!existsSync(dummyPkgFullPath))
        throw new Error(`The dummy nupkg was created, but could not be found at ${dummyPkgFullPath}. See '${createdLine}'.`);

    return dummyPkgFullPath;
}