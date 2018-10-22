const Github = require('./Github');
const client = new Github({ token: process.env.OAUTH_TOKEN });


function isEmptyObject(obj) {
  var name;
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

//Récupère ids des repos
function getReposId(reposid = []){

  const stats = [];

   for(let k in reposid) {
    stats.push(reposid[k].full_name);
  } 

  return stats;

}

function getContributors(contributors = [], rootUsername){

  const root  = {};
  const data = {};
  const newContributors = []
  cpt = 0;

  contributors.forEach(function(item){
  
    item.forEach(function(element){

      //Si c'est le root
      if(rootUsername==element.login){

        root.id = element.id;
        root.login = element.login;
        root.avatar_url = element.avatar_url;
      }

      //C'est un contributeur
      else
      {

        // Temporaire, pour garder seulement 4 contributeurs
        if(cpt<4){
        
        let contributor = {};

        contributor.id = element.id;
        contributor.login = element.login;
        contributor.avatar_url = element.avatar_url;

        newContributors.push(contributor);
        cpt++;
      }
    }
  });
  });


  //Si le root n'a pas été trouvé
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
