module.exports = async (
	projectInfoA, 
	projectInfoB, 
	queryProjectA, 
	queryProjectB, 
	jiraProjectA, 
	jiraProjectB,
) => {
	const MongoDW = new linkapi.Component('MongoDW', {});

	// Create Issues from projectA to projectB
	await linkapi.function.execute('createIssues',
		projectInfoB.project.id,
		queryProjectA,
		jiraProjectA,
		jiraProjectB,
	);

	// Update Issues from projectA to projectB
	const issuesFromToprojectA = await MongoDW.request('GET', 'tickets_wardrobe', {
		queryString: { type: 'issue', origin: jiraProjectA, destination: jiraProjectB }
	});

	await linkapi.function.execute(
		'updateIssues', 
		issuesFromToprojectA,
		projectInfoA.project.key,
		projectInfoB.project.key, 
		jiraProjectA, 
		jiraProjectB,
	);

	// Inverted Update from projectB to projectA
	const convertedIssuesFromToprojectA = issuesFromToprojectA.map(issue => ({ from: issue.to, to: issue.from }));
	
	await linkapi.function.execute(
		'updateIssues', 
		convertedIssuesFromToprojectA,
		projectInfoB.project.jey,
		projectInfoA.project.key, 
		jiraProjectB, 
		jiraProjectA,
	);

	//----------------------------------------------------------------------------------------------------------------------------------//

	// Create Issues from projectB to projectA
	await linkapi.function.execute('createIssues',
		projectInfoA.project.id,
		queryProjectB,
		jiraProjectB,
		jiraProjectA,
	);

	// Update Issues from projectB to projectA
	const issuesFromToprojectB = await MongoDW.request('GET', 'tickets_wardrobe', {
		queryString: { type: 'issue', origin: jiraProjectB, destination: jiraProjectA }
	});

	await linkapi.function.execute(
		'updateIssues', 
		issuesFromToprojectB, 
		projectInfoB.project.jey,
		projectInfoA.project.key,
		jiraProjectB,
		jiraProjectA,
	);

	// Inverted Update from projectA to projectB
	const convertedIssuesFromToprojectB = issuesFromToprojectB.map(issue => ({ from: issue.to, to: issue.from }));
	
	await linkapi.function.execute(
		'updateIssues', 
		convertedIssuesFromToprojectB, 
		projectInfoA.project.jey,
		projectInfoB.project.key,
		jiraProjectA,
		jiraProjectB,
	);
};