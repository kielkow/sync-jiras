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

		if (!commentExists) {
			const comment = await jiraDestination.request('POST', 'issue/{id}/comment', {
				urlParams: {
					id: to,
				},
				body: {
					body: `*${commentIssue.author.displayName} response:* ${commentIssue.body}`
				}
			});

			await MongoDW.request('POST', 'tickets_wardrobe', {
				body: {
					type: 'comment',
					fromComment: commentIssue.id,
					toComment: comment.body.id,
					from,
					to,
					author: commentIssue.author.displayName
				}
			});
		}
	}
};