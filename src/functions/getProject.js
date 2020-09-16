module.exports = async (jiraName, projectKey) => {
  const jira = require("./JiraStrategy.js")[jiraName]

  const projectsInfo = await jira.request('GET', 'issue/createmeta', {});

  const project = projectsInfo.body.projects.find(project => (project.key).toUpperCase() === (projectKey).toUpperCase());

  return project;
};