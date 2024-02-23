const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  oid: {
    type: String,
    required: true,
  },
  size: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  cid: {
    type: String,
    required: true,
  },
  pay: {
    type: Number,
    required: true,
  },
  delState: {
    type: String,
    required: true,
  },
});

const Order = mongoose.model("orders", orderSchema);
module.exports = Order;
