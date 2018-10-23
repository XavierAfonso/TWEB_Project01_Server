const Github = require('./Github');

const client = new Github({ token: process.env.OAUTH_TOKEN });


// Check if the object is empty
function isEmptyObject(obj) {
  let name;
  for (name in obj) {
      if (obj.hasOwnProperty(name)) {
          return false;
      }
  }
  return true;
}

function getReposLanguagesStats(reposLanguages = []) {
  const stats = {};
  const countLanguages = o => {
    Object.keys(o).forEach(key => {
      const value = o[key];
      const current = stats[key] || 0;
      stats[key] = current + value;
    });
  };
  reposLanguages.forEach(countLanguages);
  return stats;
}

//Get the repods Id
function getReposId(reposid = []){

  const stats = [];

   for(let k in reposid) {
    stats.push(reposid[k].full_name);
  } 

  return stats;

}

// Formats 'contributors' into a JSON of the contributors of all repos of the 'rootUsername'
function getContributors(contributors = [], rootUsername){

  const root  = {};
  const data = {};
  const newContributors = []
  const idsNewContributors = [];

  cpt = 0;
  const limit = 5; //Limit of contributors

  contributors.forEach(function(item){
  
    item.forEach(function(element){

      //If it's the root
      if(rootUsername==element.login){

        root.id = element.id;
        root.login = element.login;
        root.avatar_url = element.avatar_url;
      }
      //If it's a contributor
      else
      {

        if(cpt<limit){ //TODO remove
        
        let contributor = {};

        contributor.id = element.id;

        //If the contributor don't exist yet
        if(!idsNewContributors.includes(contributor.id)){

          idsNewContributors.push(contributor.id);
          contributor.login = element.login;
          contributor.avatar_url = element.avatar_url;
          newContributors.push(contributor);

          cpt++;
        }
        }//TODO remove
      }
    });
  });

  //if the root was not found
  if(isEmptyObject(root)){

    let tmp = client.user(rootUsername);
    tmp.then(data => {
      
      root.id = data.id;
      root.login = data.login;
      root.avatar_url = data.avatar_url;
    });
  }

  data["root"] = root;
  data["contributors"] = newContributors;

  return data;
}


module.exports = {
  getReposLanguagesStats,
  getReposId,
  getContributors,
  
};
