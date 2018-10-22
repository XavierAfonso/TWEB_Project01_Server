const mongoose = require('mongoose');

const DatabaseSchema = mongoose.Schema({
  request: String,
  response: String,
});

module.exports = mongoose.model('Response', DatabaseSchema);
