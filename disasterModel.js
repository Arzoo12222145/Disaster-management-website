const mongoose = require('mongoose');
const disasterUser = new mongoose.Schema({
    name: String,
    location: String,
    disastertype: String,
    numberofpeople: Number,
    severity: String,
  });
  
  module.exports = mongoose.model("DisasterUser", disasterUser);