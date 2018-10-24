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

// Get JSON with languages stats
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

// convert JSON into an array of unique contributors
function uniqueContributors(contributors) {
  const users = new Set(); 
  contributors.forEach(function(item){
    item.forEach(function(element){
      users.add(element.login);
    });
  });
  const usersArray = Array.from(users);
  return usersArray;
}

// Formats 'contributors' into a JSON of the contributors of all repos of the 'rootUsername'
function getContributors(contributors = [], rootUsername){
  // Create language filter : 'language' 'Java'
  const resultMap = new Map();
  const usersArray = uniqueContributors(contributors);
  console.log("CONTRIBUTORS : ", usersArray);

  const requests = usersArray.map(user => satisfiesPredicate(user, 'language', 'Java'));
  return Promise.all(requests)
    .then(resultat => {
      for(let i = 0; i < usersArray.length; i++){
        resultMap.set(usersArray[i], resultat[i]);
      }
      
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
            root.predicate = resultMap.get(element.login);
           }
          //If it's a contributor
          else {
            if(cpt<limit){ //TODO remove
              let contributor = {};
              contributor.id = element.id;
              //If the contributor doesn't exist yet
              if(!idsNewContributors.includes(contributor.id)){
                idsNewContributors.push(contributor.id);
                contributor.login = element.login;
                contributor.avatar_url = element.avatar_url;
                contributor.predicate = resultMap.get(element.login);

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
          root.predicate = resultMap.get(root.login);
        });
      }

      data["root"] = root;
      data["contributors"] = newContributors;
  return data;
  })
}

// Check whether the user satisfies the predicate
function satisfiesPredicate(username, predicate, value){
  setTimeout(function(){
    switch(predicate) {
      case 'language' :
        return client.userLanguages(username)
        .then(languages => getReposLanguagesStats(languages))
        .then(stats => {
          return stats.hasOwnProperty(value);
        })
        .catch(error => console.log('satisfiedPredicates : ' + error));
        break;
      case 'company' :
        break;
      case 'location':
        break;
      case 'hireable' :
        break;
      default:
          //do nothing
    }
  }, 1000);
}


module.exports = {
  getReposLanguagesStats,
  getReposId,
  getContributors,
  
};
