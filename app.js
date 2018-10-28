// loads environment variables
require('dotenv/config');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const Github = require('./src/Github');
const utils = require('./src/utils');
const Database = require('./src/model');

const app = express();
const port = process.env.PORT || 3000;
const client = new Github({ token: process.env.OAUTH_TOKEN });
const delayCache = 1; // 1 hour

// DB connection
mongoose.connect(`mongodb://tweb:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-tfzh9.mongodb.net:27017,cluster0-shard-00-01-tfzh9.mongodb.net:27017,cluster0-shard-00-02-tfzh9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`, { useNewUrlParser: true })
  .catch((error) => {
    console.error(`MongoDB not reachable : ${error}`);
  });


// Enable CORS for the client app
app.use(cors());

// Provides JSON of user 'username'
app.get('/users/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.user(req.params.username)
    .then(user => res.send(user))
    .catch(next);
});

// Provides JSON of all co-contributors in all the user's repos
app.get('/contributors/:username/:field/:value', (req, res, next) => { // eslint-disable-line no-unused-vars
  // eslint-disable-next-line
  const username = req.params.username.toLowerCase();
  // eslint-disable-next-line
  const field = req.params.field.toLowerCase();
  // eslint-disable-next-line
  const searchValue = req.params.value.toLowerCase();

  console.log(`user : ${username}`);
  console.log(`params : ${field}/${searchValue}`);

  const request = `${username}/${field}/${searchValue}`;

  // Check in the database
  Database.findById({ _id: request }).then((data) => {
    // If the payload already exists in the database
    if (data) {
      // eslint-disable-next-line
      const updatedAt = data.updatedAt;
      const now = new Date();
      const hourDifference = Math.abs(updatedAt - now) / 36e5;

      if (hourDifference > delayCache) {
        utils.getContributorsFromGithub(username, field, searchValue)
          .then(payload => utils.updateElement(request, payload))
          .then(payload => res.send(payload))
          .catch(next);
      } else {
        res.send(data.response);
      }
    } else {
      // The payload doesn't exit
      utils.getContributorsFromGithub(username, field, searchValue)
        .then(payload => utils.saveElement(request, payload))
        .then(payload => res.send(payload))
        .catch(next);
    }
  }).catch(() => {
    utils.getContributorsFromGithub(username, field)
      .then(payload => res.send(payload))
      .catch(next);
  });
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
  console.error(`Error handler : ${err}`);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  // Clear the database
  // eslint-disable-next-line no-console
  Database.deleteMany({}).then((responses) => {
    console.log(`DROP DATABASE : ${responses}`);
    console.log(`Server listening at http://localhost:${port}`);
  });
});
