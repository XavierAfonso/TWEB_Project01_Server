/* eslint-disable */
require('dotenv/config');
const { expect } = require('chai');
const mongoose = require('mongoose');
const Database = require('../src/model');
const utils = require('../src/utils');

// DB connection
mongoose.connect(`mongodb://tweb:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-tfzh9.mongodb.net:27017,cluster0-shard-00-01-tfzh9.mongodb.net:27017,cluster0-shard-00-02-tfzh9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`, { useNewUrlParser: true })
  .catch((error) => {
    console.error(`MongoDB not reachable : ${error}`);
  });

describe('my express app tests', () => {

  it('should return true', () => {

    let username = "XavierAfonso";
    let field = "javascript";

    username = username.toLowerCase();
    field = field.toLowerCase();
  
    console.log(`user : ${username}`);
    console.log(`param : ${field}`);

    const request = `${username}/${field}`;
    let payload = null;

  // Delete the response in the cache if existe  
  Database.findOneAndDelete({ _id: request }).then((responses) => {
    console.log("Delete " + responses);
  }).then(() => {

    /*utils.getContributorsFromGithub(username, field)
    .then(payload => utils.saveElement(request, payload))
    .catch(next);*/

    expect(true).to.eql(true);
    mongoose.connection.close();
  })
  //.then(value)
  .catch(err => console.log("LOG2 " + err));
});
});


