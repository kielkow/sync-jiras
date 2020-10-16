module.exports = async (jiraName, projectKey, roleName) => {
	const jira = require("./JiraStrategy.js")[jiraName]

	const project = await jira.request('GET', 'project/{name}', {
		urlParams: {
			name: projectKey
		}
	});

	const role = project.body.roles[roleName];

	const splitRole = role.split('/');
	const roleId = splitRole[splitRole.length - 1];

	const members = await jira.request('GET', 'project/{name}/role/{id}', {
		urlParams: {
			name: projectKey,
			id: roleId
		}
	});

	return members.body.actors;
};