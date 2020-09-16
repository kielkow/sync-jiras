module.exports = async (jiraName, projectKey, memberName) => {
	const members = await linkapi.function.execute('getMembers', jiraName, projectKey);

	let member = members.filter(member => memberName.includes(member.displayName));

	if (member.length === 0) {
		member = members.filter(member => member.displayName.includes(memberName));
	}

	if (member.length > 1) {
		const oldestMember = member[member.length-1];
		return oldestMember;
	}

	return member[0];
};