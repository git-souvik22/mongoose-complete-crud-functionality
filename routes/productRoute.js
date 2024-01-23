const router = require("express").Router();
const Product = require("../models/product.js");

router.get(`/product`, async (req, res) => {
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

router.post(`/create-product`, async (req, res) => {
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

module.exports = router;
