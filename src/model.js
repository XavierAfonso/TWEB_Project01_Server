const mongoose = require('mongoose');

const DatabaseSchema = mongoose.Schema({
  _id: String,
  response: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Response', DatabaseSchema);
