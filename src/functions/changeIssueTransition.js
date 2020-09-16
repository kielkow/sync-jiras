const moment = require('moment');

module.exports = async (originIssue, destinationIssue, jiraOrigin, jiraDestination) => {
	const transitionsOrigin = await jiraOrigin.request('GET', 'issue/{id}/transitions', {
		urlParams: {
			id: originIssue.id
		}
	});

	const currentTransitionOriginIssue = transitionsOrigin.body.transitions.find(
		transition => transition.name === originIssue.fields.status.name
	);

	if (currentTransitionOriginIssue) {
		const destinationIssueDetails = await jiraDestination.request('GET', 'issue/{id}', {
			urlParams: {
				id: destinationIssue.to
			}
		});

		if (
			destinationIssueDetails.body.fields.status.name !== currentTransitionOriginIssue.name &&
			moment(destinationIssueDetails.body.fields.updated).isBefore(originIssue.fields.updated) 
		) {
			await jiraDestination.request('POST', 'issue/{id}/transitions', {
				urlParams: {
					id: destinationIssue.to
				},
				body: {
					transition: {
						id: currentTransitionOriginIssue.id
					}
				}
			});
		}
	}
};