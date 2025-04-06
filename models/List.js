// models/List.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  codes: [Number],       
  imageLinks: [String],  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('List', listSchema);
