'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RequestSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    expires:'30m',
    required: true
  },
  email: String
});

module.exports = mongoose.model('Request', RequestSchema);