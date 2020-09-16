module.exports = async (projectId, summary, description, issueType) => {
	return {
		fields: {
			project: {
				id: projectId
			},
			summary,
			description,
			issuetype: {
				name: issueType
			}
		}
	};
};