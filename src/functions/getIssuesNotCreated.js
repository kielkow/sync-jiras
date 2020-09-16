module.exports = async (issuesDestination) => {
	const MongoDW = new linkapi.Component('MongoDW', {});

	let issuesNotCreated = [];

	const issuesExists = await MongoDW.request('GET', 'tickets_wardrobe', {
		queryString: { type: 'issue' }
	});

	for (const issueDestination of issuesDestination.body.issues) {
		const issueExists = issuesExists.find(issue => issue.from === issueDestination.id || issue.to === issueDestination.id);

		if (!issueExists) {
			issuesNotCreated.push(issueDestination);
		}
	}

	return issuesNotCreated;
};