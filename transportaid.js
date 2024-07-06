const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    name: String,
    contact: String,
    location: String,
    type: String,
    details: String
});

module.exports = mongoose.model('Transport', transportSchema);
