import { ok } from 'node:assert';
import { todo } from 'node:test';
import {
	MSBuildEvaluatedProjects,
	MSBuildProject,
	MSBuildProjectPreDefinedProperties,
} from '@halospv3/hce.shared-config/dotnet/MSBuildProject';

ok(Array.isArray(MSBuildEvaluatedProjects) && MSBuildEvaluatedProjects.length === 0);

await todo(MSBuildProject.name, (t) => {
	t.todo('custom properties?');
});

ok(
	Array.isArray(MSBuildProjectPreDefinedProperties) &&
	MSBuildProjectPreDefinedProperties.length > 0
);
