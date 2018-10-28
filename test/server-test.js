
require('dotenv/config');
const { expect } = require('chai');
const mongoose = require('mongoose');
const Github = require('../src/Github');
const Database = require('../src/model');
const utils = require('../src/utils');

const client = new Github({ token: process.env.OAUTH_TOKEN });

// DB connection
mongoose.connect(`mongodb://tweb:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-tfzh9.mongodb.net:27017,cluster0-shard-00-01-tfzh9.mongodb.net:27017,cluster0-shard-00-02-tfzh9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`, { useNewUrlParser: true })
  .catch((error) => {
    console.error(`MongoDB not reachable : ${error}`);
  });


describe('Server tests', () => {
  // eslint-disable-next-line
  it('DROP the Database',  function (done){
    this.timeout(5000);
    // Detele all elements on the database
    Database.deleteMany({}).then(() => {
      done();
    }).catch((err) => {
      done(err);
    }).catch(done);
  });

  // eslint-disable-next-line
  it('Save the value on the database', function (done){
    this.timeout(15000);
    let username = 'XavierAfonso';
    let field = 'language';
    let value = 'javascript';

    username = username.toLowerCase();
    field = field.toLowerCase();
    value = value.toLowerCase();

    const request = `${username}/${field}/${value}`;

    // If element exist on the database, delete it
    Database.findOneAndDelete({ _id: request })
      .then(() => {
        // Save the element
        utils.getContributorsFromGithub(username, field)
          .then(payload => utils.saveElement(request, payload)
            .then(() => {
              done();
            }));
      })
      .catch(done);
  });

  it('Fetch user with api github', (done) => {
    const username = 'Jokau';
    client.user(username)
      .then((user) => {
        // Valide json
        expect(username).to.equal(user.login);
        done();
      })
      .catch(done);
  });

  return after(() => {
    mongoose.connection.close();
  });
});
