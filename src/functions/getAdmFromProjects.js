module.exports = async (jiraA, jiraB, projectA, projectB) => {
	const admsFromProjectA = await linkapi.function.execute(
		'getMembersByRole', 
		jiraA, 
		projectA, 
		'Administrator'
	);

	const admsFromProjectB = await linkapi.function.execute(
		'getMembersByRole', 
		jiraB, 
		projectB, 
		'Administrator'
	);

	let members = admsFromProjectA.filter(admA => admsFromProjectB.filter(admB => admB.displayName === admA.displayName));

	if (members.length === 0) {
		members = admsFromProjectB.filter(admB => admsFromProjectA.filter(admA => admA.displayName === admB.displayName));
	}

	return members[0];
};