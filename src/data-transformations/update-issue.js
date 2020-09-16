module.exports = async (originIssue, assignee, destinationIssueDetails) => {
	const updatedFields = {
		update: {
			summary: [
				{
					set: originIssue.summary
				}
			],
			description: [
				{
					set: originIssue.description
				}
			],
			priority: [
				{
					set: {
						name: originIssue.priority.name
					},
				}
			],
			assignee: [
				{
					set: {
						accountId: assignee.actorUser.accountId
					},
				}
			],
			labels: [
				{
					set: originIssue.labels
				}
			],
		}
	};

	if (originIssue.parent || destinationIssueDetails.fields.parent) delete updatedFields.update.priority;

	return updatedFields;
};