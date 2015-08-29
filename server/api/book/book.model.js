'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BookSchema = new Schema({
  name: String,
  status: String,
  img: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
  trader: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
});

module.exports = mongoose.model('Book', BookSchema);