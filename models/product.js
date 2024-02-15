const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: [String],
  stock: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  pState: {
    type: String,
    default: "unpublish",
  },
  sid: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("products", productSchema);

module.exports = Product;
