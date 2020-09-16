module.exports = async (from, to, commentsIssue, jiraDestination) => {
	const moment = require('moment');
	const MongoDW = new linkapi.Component('MongoDW', {});

	const comments = await MongoDW.request('GET', 'tickets_wardrobe', {
		type: 'comment',
		from,
		to
	});

	for (const commentIssue of commentsIssue) {
		const commentExists = comments.find(comment => (comment.fromComment === commentIssue.id) || (comment.toComment === commentIssue.id));

		if (commentExists) {
			try {
				const jiraDestinationIssue = await jiraDestination.request('GET', 'issue/{issueId}/comment/{id}', {
					urlParams: {
						issueId: to,
						id: commentExists.toComment
					},
				});

				if (moment(jiraDestinationIssue.body.updated).isBefore(moment(commentIssue.updated))) {
					await jiraDestination.request('PUT', 'issue/{issueId}/comment/{id}', {
						urlParams: {
							issueId: to,
							id: commentExists.toComment
						},
						body: {
							body: `${('*').concat(commentExists.author).concat(' response:* ') || ''}${commentIssue.body.split('response:* ')[1]}`
						}
					});
				}
			} catch (err) {
				const jiraDestinationIssue = await jiraDestination.request('GET', 'issue/{issueId}/comment/{id}', {
					urlParams: {
						issueId: to,
						id: commentExists.fromComment
					},
				});

				if (moment(jiraDestinationIssue.body.updated).isBefore(moment(commentIssue.updated))) {
					await jiraDestination.request('PUT', 'issue/{issueId}/comment/{id}', {
						urlParams: {
							issueId: to,
							id: commentExists.fromComment
						},
						body: {
							body: `${('*').concat(commentExists.author).concat(' response:* ') || ''}${commentIssue.body.split('response:* ')[1]}`
						}
					});
				}
			}
		}
	}
};