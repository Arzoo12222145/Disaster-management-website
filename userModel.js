// models/form.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  contact: Number,
  location: String,
  type: String,
  details: String,
});

module.exports = mongoose.model("User", userSchema);