module.exports = async (destinationIssueId, commentsIssue, jiraDestination) => {
	const MongoDW = new linkapi.Component('MongoDW', {});

	const commentsFromTo = await MongoDW.request('GET', 'tickets_wardrobe', {
		queryString: {
			type: 'comment',
			to: destinationIssueId,
		}
	});

	for (const commentFromTo of commentsFromTo) {
		const commentExist = commentsIssue.find(comment => comment.id === commentFromTo.fromComment);

		if (!commentExist) {
			await jiraDestination.request('DELETE', 'issue/{issueId}/comment/{id}', {
				urlParams: {
					issueId: destinationIssueId,
					id: commentFromTo.toComment
				}
			});

			await MongoDW.request('DELETE', 'tickets_wardrobe', {
				queryString: {
					toComment: commentFromTo.toComment
				}
			});
		}
	}
};