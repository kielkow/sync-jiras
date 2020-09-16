class Automation {
  async run(ctx) {
    // TODO -> Inserir assigne da task pai nas subtasks
    // TODO -> Mensagem de erro no Slack
    // TODO -> Utilizar lib JaroWinkler para selecionar assignee

    try {
      const projectInfoWardrobe = await linkapi.function.execute('getProjectInfo', 'wardrobe', 'WAR');
      const projectInfoSamsungSS = await linkapi.function.execute('getProjectInfo', 'samsung', 'SS');

      await linkapi.function.execute('executeIntegration', 
        projectInfoSamsungSS, 
        projectInfoWardrobe,
        'project = "SEDA E-Commerce Synapcom" AND status = "To Do" AND (assignee = "Matheus Kielkowski" OR assignee = "Victor Fonseca" OR assignee = "Victor Santos")',
        'project = "Wardrobe" AND status = "To Do" AND (assignee = "Matheus Kielkowski" OR assignee = "Victor Fonseca" OR assignee = "Victor Santos") AND labels = "SS"',
        'samsung',
        'wardrobe'
      );

      return {
        status: 200
      }
    } catch (err) {
      return {
        status: 500,
        message: err.message || err,
        stack: err.stack || err
      }
    }
  }
};

module.exports = new Automation();
