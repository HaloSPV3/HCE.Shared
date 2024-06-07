import { deepStrictEqual, ok } from 'node:assert';
import { describe, it, todo } from 'node:test';
import {
	MSBuildEvaluatedProjects,
	MSBuildProject,
	MSBuildProjectPreDefinedProperties,
} from '@halospv3/hce.shared-config/dotnet/MSBuildProject';

await describe('MSBuildProject', async () => {
	await describe('MSBuildEvaluatedProjects', async () => {
		await it('is empty by default', () => {
			ok(Array.isArray(MSBuildEvaluatedProjects) && MSBuildEvaluatedProjects.length === 0);
		});
	});

	await describe('MSBuildProject', async () => {
		await it('has f', () => {
			ok('evaluateProperties' in MSBuildProject);
		})

		await todo('custom properties?');
	});

	await describe('MSBuildPreDefinedProperties', () => {
		deepStrictEqual(
			MSBuildProjectPreDefinedProperties,
			[
				'TargetFramework',
				'TargetFrameworks',
				'RuntimeIdentifier',
				'RuntimeIdentifiers'
			]
		);
	});
});


