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
      newKey = key.toLowerCase();
      newKey = newKey.replace(/ /g,'');
      const value = o[key];
      const current = stats[key] || 0;
      stats[newKey] = current + value;
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
// with predicate value upon 'language'
function getContributors(contributors = [], rootUsername, language){

  const resultMap = new Map();
  let usersArray = [];
  const root  = {};
  const data = {};
  let newContributors = []
  const idsNewContributors = [];
  let cpt = 0;
  const limit = 5; //Limit of contributors
  let myContinue = true;

   return new Promise(
    function (resolve, reject) {

      for(let x = 0; x<contributors.length && myContinue; x++){    

        let item = contributors[x];

          for(let y = 0; y <item.length && myContinue; y++){

            let element = item[y];

            //If it's the root
            if(rootUsername==element.login.toLowerCase()){
              root.id = element.id;
              root.login = element.login;
              root.avatar_url = element.avatar_url;
              root.html_url = element.html_url;
              usersArray.push(root.login);
            } 

            //If it's a contributor
            else {
              let contributor = {};
              contributor.id = element.id;

              //If the contributor doesn't exist yet
              if(!idsNewContributors.includes(contributor.id)){
                idsNewContributors.push(contributor.id);
                contributor.login = element.login;
                contributor.avatar_url = element.avatar_url;
                contributor.html_url = element.html_url;
                usersArray.push(contributor.login);
                newContributors.push(contributor);
                cpt++;
              }
           }

          // Check the limit
          if(cpt >= limit){
            myContinue = false;
          }
        }
      }

      resolve();
    })
    
    .then(() => {

      // If the root is empty
      if(isEmptyObject(root)){
          return client.user(rootUsername);
      }

    }).then(data =>{

      // The root must be updated
      if(data!=null){
        root.id = data.id;
        root.login = data.login;
        root.avatar_url = data.avatar_url;
        root.html_url = data.html_url;
        usersArray.push(root.login);
      }
    })
    .then(() =>{

    // Check the predicate
    return Promise.all(usersArray.map(user => calcultePredicate(user, 'language', language)))
    .then(resultat => {

      for(let i = 0; i < usersArray.length; i++){
        resultMap.set(usersArray[i], resultat[i]);
      }

      root.predicate = resultMap.get(root.login);

      for(let x = 0; x < newContributors.length; x++){
          newContributors[x].predicate = resultMap.get(newContributors[x].login);
      }

    }).then(()=>{

      // return the data
      data["root"] = root;
      data["contributors"] = newContributors;
      return data;

    }).catch(err => {
      
      console.log(err);

      // return the data anyway ?
      data["root"] = root;
      data["contributors"] = newContributors;
      return data;
    });

  });
}

// Check whether the user satisfies the predicate
function calcultePredicate(username, field, value){

  return new Promise(
    function (resolve, reject) {

    switch(field) {
      case 'language' :
        return client.userLanguages(username)
        .then(languages => getReposLanguagesStats(languages))
        /*.then(result => new Promise(resolve => { // <== create a promise here
          setTimeout(function() {
            console.log("Time out Done!");
            console.log(result);
            console.log("========== Then Block 3");
            resolve(result); // <== resolve it in callback
          }, 5000)}))*/
        .then(stats => {

          let find =  stats.hasOwnProperty(value);
    
          console.log(stats);
          console.log(username + " : " + " : " + find);

          return resolve(find);
        })
        .catch(error => {
          console.log('satisfiedPredicates : ' + error);
          return resolve(false); // return false if error
      });
      case 'company' :
        break;
      case 'location':
        break;
      case 'hireable' :
        break;
      default:
          //do nothing
    }
  });
}

module.exports = {
  getReposLanguagesStats,
  getReposId,
  getContributors,
  
};
