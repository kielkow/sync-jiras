module.exports = async (id, jiraOrigin) => {
	const comments = await jiraOrigin.request('GET', 'issue/{id}/comment', {
		urlParams: {
			id,
		}
	});

	return comments.body.comments;
};