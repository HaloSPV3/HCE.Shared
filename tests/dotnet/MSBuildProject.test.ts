import { deepStrictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
import {
	MSBuildProject,
} from '@halospv3/hce.shared-config/dotnet/MSBuildProject';

await describe('MSBuildProject', async () => {
	await describe('MatrixProperties', async (ctx1) => {
		await it("has expected name", async () => {
			ok(ctx1.name in MSBuildProject);
		})
		await it("is array of expected values", async () => {
			deepStrictEqual(
				MSBuildProject.MatrixProperties,
				[
					'TargetFramework',
					'TargetFrameworks',
					'RuntimeIdentifier',
					'RuntimeIdentifiers'
				]
			);

		})
	});
});


