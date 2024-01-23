const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const apiURL = process.env.API;
// middlewares
// makes JSON data readable for backend if data is sent from frontend to backend
app.use(express.json());

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("products", productSchema);

app.get(`${apiURL}/product`, async (req, res) => {
  const getAllProducts = await Product.find();
  if (getAllProducts) {
    res.status(200).json({
      success: true,
      products: getAllProducts,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "cannot get product details",
    });
  }
});

app.post(`${apiURL}/create-product`, async (req, res) => {
  const newProduct = req.body;
  const createProduct = new Product({
    name: newProduct.name,
    image: newProduct.image,
    stock: newProduct.stock,
    category: newProduct.category,
    price: newProduct.price,
  });
  const saveProduct = await createProduct.save();

  if (saveProduct) {
    res.status(201).json({
      success: true,
      result: saveProduct,
    });
  } else {
    res.status(500).json({
      success: false,
      message: "product data cannot be created",
    });
  }
});

// db connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(5000, () => {
  console.log(`Server is running on: http://127.0.0.1:5000`);
});
