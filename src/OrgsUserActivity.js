const Organization = require('./src/githublib/Organization');

module.exports = class OrganizationActivity {

  constructor(octokit) {
    this._organization = new Organization(octokit);
    this._repositoryActivity = new RepositoryActivity(octokit);
    this._removeUser = new RemoveUser(octokit);
  }
    async getOrgsValid (org) {
        const self = this;
        const orgsValid = await self.organizationClient.getOrgs(org);
    
        return orgsValid;
        
      }
}