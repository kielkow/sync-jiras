module.exports = async (parentId, projectId, summary, description, issueTypeSubTask) => {
	return {
		fields: {
			parent: {
				id: parentId
			},
			project: {
				id: projectId
			},
			summary,
			description,
			issuetype: {
				name: issueTypeSubTask
			}
		}
	};
};