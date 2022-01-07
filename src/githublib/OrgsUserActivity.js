const Organization = require('./src/githublib/Organization');

module.exports = class OrganizationUserActivity {
    async getOrgsValid (org) {
        const self = this;
        const orgsValid = await self.organizationClient.getOrgs(org);
    
        return orgsValid;
        
      }
}