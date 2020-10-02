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

	for (let i = originIssuesNotCreated.length - 1; i >= 0; i--) {
		const formattedCreateIssue = await linkapi.dt.transform('create-issue', 
			projectId, 
			originIssuesNotCreated[i].fields.summary, 
			originIssuesNotCreated[i].fields.description,
			originIssuesNotCreated[i].fields.issuetype.name
		);

		const issue = await jiraDestination.request('POST', 'issue', { body: formattedCreateIssue });

		await MongoDW.request('POST', 'tickets_wardrobe', {
			body: {
				type: 'issue',
				origin,
				destination,
				from: originIssuesNotCreated[i].id,
				to: issue.body.id
			}
		});
	}

	for (let i = subIssuesNotCreated.length - 1; i >= 0; i--) {
		let issue;

		const parentDestination = await MongoDW.request('GET', 'tickets_wardrobe', {
			queryString: {
				type: 'issue',
				from: subIssuesNotCreated[i].fields.parent.id
			}
		});

		if (parentDestination.length > 0) {
			const formattedCreateSubIssue = await linkapi.dt.transform('create-subissue',
				parentDestination[0].to,
				projectId,
				subIssuesNotCreated[i].fields.summary,
				subIssuesNotCreated[i].fields.description,
				subIssuesNotCreated[i].fields.issuetype.name
			);

			issue = await jiraDestination.request('POST', 'issue', {
				body: formattedCreateSubIssue
			});
		}
		else {
			const formattedCreateIssue = await linkapi.dt.transform('create-issue',
				projectId,
				subIssuesNotCreated[i].fields.summary,
				subIssuesNotCreated[i].fields.description,
				subIssuesNotCreated[i].fields.parent.fields.issuetype.name
			);

			issue = await jiraDestination.request('POST', 'issue', { body: formattedCreateIssue });
		}

		await MongoDW.request('POST', 'tickets_wardrobe', {
			body: {
				type: 'issue',
				origin,
				destination,
				from: subIssuesNotCreated[i].id,
				to: issue.body.id
			}
		});
	}
};