module.exports = async (
	projectId,
	query,
	origin,
	destination
) => {
	const jiraOrigin = require("./JiraStrategy.js")[origin]
	const jiraDestination = require("./JiraStrategy.js")[destination]
	const MongoDW = new linkapi.Component('MongoDW', {});

	const issuesDestination = await jiraOrigin.request('GET', 'search', {
		queryString: {
			jql: query,
		},
	});

	const issuesNotCreated = await linkapi.function.execute('getIssuesNotCreated', issuesDestination);

	const originIssuesNotCreated = issuesNotCreated.filter(issue => !issue.fields.parent);

	const subIssuesNotCreated = issuesNotCreated.filter(issue => issue.fields.parent);

	for (originIssueNotCreated of originIssuesNotCreated) {
		const formattedCreateIssue = await linkapi.dt.transform('create-issue', 
			projectId, 
			originIssueNotCreated.fields.summary, 
			originIssueNotCreated.fields.description,
			originIssueNotCreated.fields.issuetype.name
		);

		const issue = await jiraDestination.request('POST', 'issue', { body: formattedCreateIssue });

		await MongoDW.request('POST', 'tickets_wardrobe', {
			body: {
				type: 'issue',
				origin,
				destination,
				from: originIssueNotCreated.id,
				to: issue.body.id
			}
		});
	}

	for (subIssueNotCreated of subIssuesNotCreated) {
		let issue;

		const parentDestination = await MongoDW.request('GET', 'tickets_wardrobe', {
			queryString: {
				type: 'issue',
				from: subIssueNotCreated.fields.parent.id
			}
		});

		if (parentDestination.length > 0) {
			const formattedCreateSubIssue = await linkapi.dt.transform('create-subissue',
				parentDestination[0].to,
				projectId,
				subIssueNotCreated.fields.summary,
				subIssueNotCreated.fields.description,
				subIssueNotCreated.fields.issuetype.name
			);

			issue = await jiraDestination.request('POST', 'issue', {
				body: formattedCreateSubIssue
			});
		}
		else {
			const formattedCreateIssue = await linkapi.dt.transform('create-issue',
				projectId,
				subIssueNotCreated.fields.summary,
				subIssueNotCreated.fields.description,
				subIssueNotCreated.fields.parent.fields.issuetype.name
			);

			issue = await jiraDestination.request('POST', 'issue', { body: formattedCreateIssue });
		}

		await MongoDW.request('POST', 'tickets_wardrobe', {
			body: {
				type: 'issue',
				origin,
				destination,
				from: subIssueNotCreated.id,
				to: issue.body.id
			}
		});
	}
};