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

function getContributors(contributors = []){

  const clean = {};

  contributors.forEach(function(item){
  
    item.forEach(function(element){
  
        let contri = {};
        //collabo.id = element.login;
        contri.login = element.login;
        contri.avatar_url = element.avatar_url;

        clean[element.id] = contri;

        //clean.push(collabo);
    
    });

  });

  return clean;


   /*
   
   Pour un repos
   
   for(let k in collaraborators) {

      for(let y in k){
      let currentCollaraborator = {}

      currentCollaraborator.login = collaraborators[y].login;
      currentCollaraborator.id = collaraborators[y].id;
      currentCollaraborator.avatar_url = collaraborators[y].avatar_url;

      clean.push(currentCollaraborator);
      }
  } 

  return clean;*/
  
}



module.exports = {
  getReposLanguagesStats,
  getReposId,
  getContributors,
};
