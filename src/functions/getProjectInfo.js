module.exports = async (jiraName, projectKey) => {
	const project = await linkapi.function.execute('getProject', jiraName, projectKey);
	const members = await linkapi.function.execute('getMembers', jiraName, projectKey);

	return { project, members };
};