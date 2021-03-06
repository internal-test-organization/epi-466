const fs = require('fs')
  , path = require('path')
  , core = require('@actions/core')
  , io = require('@actions/io')
  , json2csv = require('json2csv')
  , github = require('@actions/github')
  , githubClient = require('./src/githublib/githubClient')
  , OrganizationActivity = require('./src/OrgsUserActivity')
  , Organization = require('./src/githublib/Organization')
;

async function run() {
  const token = core.getInput('token')
    , outputDir = core.getInput('outputDir')
    , organizationinp = core.getInput('organization')
    , maxRetries = core.getInput('octokit_max_retries')
  ;
console.log(organizationinp)
let regex = /^[\w\.\_\-]+((,|-)[\w\.\_\-]+)*[\w\.\_\-]+$/g;
let validate_org = regex.test(organizationinp);
if((!validate_org)) {
  throw new Error('Provide a valid organization - It accept only comma separated value');
}

let sinceregex = /^(20)\d\d-(0[1-9]|1[012])-([012]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/ 
;

await io.mkdirP(outputDir)

const octokit = githubClient.create(token, maxRetries)
  , orgActivity = new OrganizationActivity(octokit)
  , orgActivity1 = new Organization(octokit)
;



//***start */
let organizationlist = organizationinp.split(',');
let OvSecret = [];
let repos = [];

let newrepo = [];

console.log(organizationlist)
for(const organization of organizationlist){
  console.log(`Attempting to generate ${organization} - user activity data, this could take some time...`);
  const orgsComments = await orgActivity.getOrgsValid(organization);
  if(orgsComments.status !== 'error') {
       secrets = await orgActivity1.getOrgSecrets(organization);
       console.log(secrets);
       console.log(secrets[0].name);
       secrets.map(({name}) => {
          console.log(name)
          OvSecret.push(name);
       })
      let secretlist = [];
      for(const secret of OvSecret){
         repos = await orgActivity1.getOverridenSecretsrepos(organization,secret);
         secretlist.push(secret)
      }
      for(const repo of repos){
         newrepo.push({org:organization,name:repo.name,message:"org secrets overriden","orgs-secrets-overriden":secretlist})
      } 
  }
} 
saveIntermediateData(outputDir, newrepo);


function saveIntermediateData(directory, data) {
  try {
    const file = path.join(directory, 'org-overriden-secret.json');
    fs.writeFileSync(file, JSON.stringify(data));
    core.setOutput('report_json', file);
  } catch (err) {
    console.error(`Failed to save intermediate data: ${err}`);
  }
}

core.setOutput('repos', repos);
core.setOutput('secret',secrets);
core.setOutput('report',newrepo);
}

run();