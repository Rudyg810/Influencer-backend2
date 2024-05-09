const mongoose = require("mongoose");

const UpdateSchema = new mongoose.Schema({
  users: [String], // Array of strings to store user names
  totalPrice: {
    type: Number,
    required: true
  },
  counter: {
    level1: {
      type: Number,
      default: 0
    },
    level2: {
      type: Number,
      default: 0
    },
    level3: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model("Update", UpdateSchema);
