module.exports = async (jiraName, projectKey) => {
	const jira = require("./JiraStrategy.js")[jiraName]

	const project = await jira.request('GET', 'project/{name}', {
		urlParams: {
			name: projectKey
		}
	});

	const arrayProjectRoles = Object.values(project.body.roles);

	let allMembers = [];

	for (const role of arrayProjectRoles) {
		const splitRole = role.split('/');
		const roleId = splitRole[splitRole.length - 1];

		const members = await jira.request('GET', 'project/{name}/role/{id}', {
			urlParams: {
				name: projectKey,
				id: roleId
			}
		});

		allMembers = [...allMembers, ...members.body.actors];
	}

	return allMembers;
};