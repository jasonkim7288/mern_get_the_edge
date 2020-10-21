const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleID: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  photo: String,
  crawls: [{
    crawl: {
      type: Schema.Types.ObjectId,
      ref: 'crawls'
    }
  }]
});

module.exports = mongoose.model('users', UserSchema);