const mongoose = require("mongoose");

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const userSchema = new Schema({
  username: {
    type: String,
    required: 'please enter username',
  },
  email: {
    type: String,
    required: 'please enter email address',
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    default: "",
    required: false
  },
},
{
  timestamps: true
});

// module.exports = mongoose.model("User", userSchema);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
