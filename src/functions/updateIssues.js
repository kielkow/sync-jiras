module.exports = async (issuesFromTo, projectKey, origin, destination) => {
	if (issuesFromTo.length !== 0) {
		const jiraOrigin = require("./JiraStrategy.js")[origin]
		const jiraDestination = require("./JiraStrategy.js")[destination]

		const fromIssuesIds = issuesFromTo.map(issue => issue.from);

		const toIssuesIds = issuesFromTo.map(issue => issue.to);

		const originIssues = await jiraOrigin.request('GET', 'search', {
			queryString: {
				jql: `issuekey in (${fromIssuesIds.toString()})`
			}
		});

		const destinationIssuesToUpdate = await jiraDestination.request('GET', 'search', {
			queryString: {
				jql: `issuekey in (${toIssuesIds.toString()})`
			}
		});

		for (const originIssue of originIssues.body.issues) {
			const destinationIssue = issuesFromTo.find(issue => issue.from === originIssue.id);

			const destinationIssueDetails = destinationIssuesToUpdate.body.issues.find(issue => issue.id === destinationIssue.to);

			const assignee = await linkapi.function.execute('getMember', destination, projectKey, originIssue.fields.assignee.displayName);

			const comments = await linkapi.function.execute('getComments', originIssue.id, jiraOrigin);

			const updatedFields = await linkapi.dt.transform('update-issue', originIssue.fields, assignee, destinationIssueDetails);

			destinationIssue.fields = updatedFields;

			await jiraDestination.request('PUT', 'issue/{id}', {
				urlParams: {
					id: destinationIssue.to
				},
				body: updatedFields
			});

			await linkapi.function.execute('createComments', originIssue.id, destinationIssue.to, comments, jiraDestination);

			await linkapi.function.execute('updateComments', originIssue.id, destinationIssue.to, comments, jiraDestination);

			await linkapi.function.execute('deleteComments', destinationIssue.to, comments, jiraDestination);

			await linkapi.function.execute('changeIssueTransition', originIssue, destinationIssue, jiraOrigin, jiraDestination);
		}
	}
};