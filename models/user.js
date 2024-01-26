const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: Number,
    unique: true,
    min: 10,
    required: true,
  },
  password: {
    type: String,
    min: 8,
    required: true,
  },
  cpassword: {
    type: String,
    min: 8,
  },
  state: {
    type: String,
    default: null,
  },
  cityvill: {
    type: String,
    default: null,
  },
  pin: {
    type: Number,
    default: null,
  },
  nearloc: {
    type: String,
    default: null,
  },
  isAdmin: {
    type: Number,
    default: 0,
  },
  logState: {
    type: String,
    default: "out",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model("users", userSchema);
module.exports = User;
