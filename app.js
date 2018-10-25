// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Github = require('./src/Github');
const utils = require('./src/utils');
const Database = require('./src/model');

const app = express();
const port = process.env.PORT || 3000;
const client = new Github({ token: process.env.OAUTH_TOKEN });
const delayCache = 1; // 1 hour

// DB connection
mongoose.connect(`mongodb://tweb:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-tfzh9.mongodb.net:27017,cluster0-shard-00-01-tfzh9.mongodb.net:27017,cluster0-shard-00-02-tfzh9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`, { useNewUrlParser: true })
.catch(error => {console.error("MongoDB not reachable : " + error)});

// Enable CORS for the client app
app.use(cors());

function getContributors(username, field) {
  return client.reposContributors(username)
    .then(data => utils.getContributors(data, username, field))
}

function getContributorsFromGithub(username, field, update) {
  const payload = [];
  let stringPayload = '';

  // Root
  return getContributors(username, field).then((data) => {
    payload.push(data);

    const rootContributors = payload[0].contributors;
    const nameContributorsOfRoot = rootContributors.map(contributors => contributors.login);

    const ihavenotidea = name => getContributors(name,field);

    // Contributors
    return Promise.all((nameContributorsOfRoot).map(ihavenotidea)).then((element) => {
      element.forEach((item) => {
        payload.push(item);
      });
    });
  }).then(() => {
    stringPayload = JSON.stringify(payload);
    const request = username + "/" + field;

    if(!update){
    const document = new Database({ _id: request, response: stringPayload });
    document.save().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });
  }
  else{
    Database.collection.findOneAndUpdate({ _id: request }, { $set: { response: stringPayload , updatedAt: new Date()}}).then(result => console.log(result));
  }
    return payload;
    //res.send(payload);
  });
}

// Provides JSON of user 'username'
app.get('/users/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.user(req.params.username)
    .then(user => res.send(user))
    .catch(next);
});

// Provides JSON of all co-contributors in all the user's repos
app.get('/contributors/:username/:field', (req, res, next) => { // eslint-disable-line no-unused-vars
  
  let username = req.params.username;
  let field = req.params.field;
  username = username.toLowerCase();
  field = field.toLowerCase();

  console.log('user :' + username);
  console.log('param :' + field);
  const request = username + "/" + field;

  // Check in the database
  Database.findById({_id: request}).then((data) => {
   
    // If the payload already exists in the database
    if (data) {

        let updatedAt = data.updatedAt;
        let now = new Date();
        let hourDifference = Math.abs(updatedAt - now) / 36e5;

        if(hourDifference > delayCache){
            getContributorsFromGithub(username, field, true).then(payload => res.send(payload))
             .catch(next);
        }
        else{
          res.send(data.response);
        }
    }
    //The payload doesn't exit
    else{
      getContributorsFromGithub(username, field, false).then(payload => res.send(payload))
      .catch(next);
    }
  }).catch(next);
});

// Provides JSON of all user's repos
app.get('/repos/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.repos(req.params.username)
    .then(utils.getReposId)
    .then(user => res.send(user))
    .catch(next);
});

// Provides JSON of languages used in all the user's repos
app.get('/languages/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.userLanguages(req.params.username)
    .then(utils.getReposLanguagesStats)
    .then(stats => res.send(stats))
    .catch(next);
});

// Forward 404 to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Error handler : ' + err);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
