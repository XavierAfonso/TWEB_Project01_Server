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

mongoose.connect(`mongodb://tweb:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-tfzh9.mongodb.net:27017,cluster0-shard-00-01-tfzh9.mongodb.net:27017,cluster0-shard-00-02-tfzh9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`, { useNewUrlParser: true });

function getContributors(username) {
  return client.reposContributors(username)
    .then(data => utils.getContributors(data, username));
}

function getContributorsFromGithub(username) {

  const payload = [];
  let stringPayload = '';

  // Root
  return getContributors(username).then((data) => {
    payload.push(data);

    const rootContributors = payload[0].contributors;
    const nameContributorsOfRoot = rootContributors.map(contributors => contributors.login);

    // Contributors
    return Promise.all((nameContributorsOfRoot).map(getContributors)).then((element) => {
      element.forEach((item) => {
        payload.push(item);
      });
    });
  }).then(() => {
    stringPayload = JSON.stringify(payload);
    const document = new Database({ request: username, response: stringPayload });
    document.save().then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });

    return payload;
    //res.send(payload);
  });
}

// Enable CORS for the client app
app.use(cors());

app.get('/users/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.user(req.params.username)
    .then(user => res.send(user))
    .catch(next);
});

app.get('/contributors/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  
  const username = req.params.username;
  console.log(req.params.username);
  // Check the database
  Database.findOne({ request: username }).then((data) => {
   
    // If the payload already exist on the database
    if (data) {
      res.send(data.response);
    }

    //The payload don't exit
    else{

      console.log(data);
      getContributorsFromGithub(username).then(payload => {
        
        console.log(payload);
        res.send(payload)}
      );
    }

  //Maybe the database is not reachable
  }).catch((err) => {
    
    console.log(err);
    getContributorsFromGithub(username).then(payload => res.send(payload));
  });

});

app.get('/repos/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.repos(req.params.username)
    .then(utils.getReposId)
    .then(user => res.send(user))
    .catch(next);
});

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
  console.error(err);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
