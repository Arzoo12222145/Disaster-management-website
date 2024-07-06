const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
  username: String,
  password: String
});

module.exports = mongoose.model('UserAuth', UserAuthSchema);
