const Github = require('./Github');
const Database = require('../src/model');

const client = new Github({ token: process.env.OAUTH_TOKEN });
const resultMap = new Map();

// Get JSON with languages stats
function getReposLanguagesStats(reposLanguages = []) {
  const stats = {};
  const countLanguages = (o) => {
    Object.keys(o).forEach((key) => {
      let newKey = key.toLowerCase();
      newKey = newKey.replace(/ /g, '');
      const value = o[key];
      const current = stats[key] || 0;
      stats[newKey] = current + value;
    });
  };
  reposLanguages.forEach(countLanguages);
  return stats;
}

// Get the repods Id
function getReposId(reposid = []) {
  const stats = [];

  Object.keys(reposid).forEach((repo) => {
    stats.push(repo.full_name);
  });

  return stats;
}
// Check whether the user satisfies the predicate
function calcultePredicate(username, field, value) {
  return new Promise((resolve) => {
    // if we already now the result

    if (resultMap.has(username)) {
      // We already know the result
    } else {
      switch (field) {
        case 'language':
          return client.userLanguages(username)
            .then(languages => getReposLanguagesStats(languages))
            .then((stats) => {
              const find = Object.prototype.hasOwnProperty.call(stats, value);
              resultMap.set(username, find);
              console.log(stats);
              console.log(`${username} :  ${find}`);
              // return resolve(find);
              return resolve();
            })
            .catch((error) => {
              console.log(`satisfiedPredicates : ${error}`);
              // return resolve(false); // return false if error
              return resolve();
            });
        case 'company':
          break;
        case 'location':
          break;
        case 'hireable':
          break;
        default:
            // do nothing
      }
    }
    // return resolve(result);
    return resolve();
  });
}

// Formats 'contributors' into a JSON of the contributors of all repos of the 'rootUsername'
// with predicate value upon 'language'
function getFormattedContributors(contributors = [], rootUsername, language) {

  const usersArray = [];
  let root = null;
  const data = {};
  const newContributors = [];
  const uniqueIds = [];
  let cpt = 0;
  const limit = 5; // Limit of contributors
  let myContinue = true;

  return new Promise((resolve) => {
    for (let x = 0; x < contributors.length && myContinue; x++) {
      const item = contributors[x];
      for (let y = 0; y < item.length && myContinue; y++) {
        const element = item[y];

        if (!uniqueIds.includes(element.id)) {
          uniqueIds.push(element.id);

          // If it's the root
          if (rootUsername === element.login.toLowerCase()) {
            root = {};
            root.id = element.id;
            root.login = element.login;
            root.avatar_url = element.avatar_url;
            root.html_url = element.html_url;
            usersArray.push(root.login);
          } else {
            // If it's a contributor
            const contributor = {};
            contributor.id = element.id;

            // If the contributor doesn't exist yet
            contributor.login = element.login;
            contributor.avatar_url = element.avatar_url;
            contributor.html_url = element.html_url;
            usersArray.push(contributor.login);
            newContributors.push(contributor);
            cpt++;
          }
        }

        // Check the limit
        if (cpt >= limit) {
          myContinue = false;
        }
      }
    }
    resolve();
  }).then(() => {
    // If the root is empty
    if ((root == null)) {
      return client.user(rootUsername);
    }
    return null;
  }).then((value) => {
    // The root must be updated
    if (value != null) {
      root = {};
      root.id = value.id;
      root.login = value.login;
      root.avatar_url = value.avatar_url;
      root.html_url = value.html_url;
      usersArray.push(root.login);
    }
  }).then(() => {

    // Check the predicate
    return Promise.all(usersArray.map(user => calcultePredicate(user, 'language', language)))
      .then(() => {
        root.predicate = resultMap.get(root.login);

        for (let x = 0; x < newContributors.length; x++) {
          newContributors[x].predicate = resultMap.get(newContributors[x].login);
        }
      }).then(() => {
        // return the data
        data.root = root;
        data.contributors = newContributors;
        return data;
      }).catch((err) => {
        console.log(err);
        // return the data anyway ?
        data.root = root;
        data.contributors = newContributors;
        return data;
      });
  });
}

function getContributors(username, field) {
  return client.reposContributors(username)
    .then(data => getFormattedContributors(data, username, field));
}

function getContributorsFromGithub(username, field) {
  const payload = [];

  // Root
  return getContributors(username, field).then((data) => {
    payload.push(data);

    const rootContributors = payload[0].contributors;
    const nameContributorsOfRoot = rootContributors.map(contributors => contributors.login);

    const mapContributors = name => getContributors(name, field);

    // Contributors
    return Promise.all((nameContributorsOfRoot).map(mapContributors)).then((element) => {
      element.forEach((item) => {
        payload.push(item);
      });
      return payload;
    });
  });
}

function saveElement(request, payload) {

  const stringPayload = JSON.stringify(payload);
  const document = new Database({ _id: request, response: stringPayload });

  return document.save().then((result) => {
    console.log(result);
    return payload;
  }).catch((error) => {
    console.log(error);
    return payload;
  });
}

function updateElement(request, payload) {
  const stringPayload = JSON.stringify(payload);
  return Database.collection.findOneAndUpdate({ _id: request },
    { $set: { response: stringPayload, updatedAt: new Date() } })
    .then((result) => {
      console.log(result);
      return payload;
    }).catch((error) => {
      console.log(error);
      return payload;
    });
}

module.exports = {
  getReposLanguagesStats,
  getReposId,
  getContributors,
  getContributorsFromGithub,
  saveElement,
  updateElement,
};
