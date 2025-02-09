const mongoose = require('mongoose');

const  users= new mongoose.Schema({
 username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Usertoken: {
    type: String,
  },
});

const User = mongoose.model('User', users);

module.exports = User;
