const router = require("express").Router();
const Product = require("../models/product.js");
const auth = require("../auth/authRoutes.js");

router.get("/product", auth, async (req, res) => {
  const databyCat = await Product.aggregate([
    { $group: { _id: "$category", details: { $push: "$$ROOT" } } },
  ]);
  try {
    const getAllProducts = await Product.find();
    if (getAllProducts) {
      res.status(200).json({
        success: true,
        products: getAllProducts,
        databyCat,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "cannot get product details",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Cannot fetch products data",
    });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const getOneProduct = await Product.findById(req.params.id);
    if (getOneProduct) {
      res.status(200).json({
        success: true,
        result: [getOneProduct],
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Product cannot get",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "failed to find product",
    });
  }
});

router.post("/create-product", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      message: "Product creation postponed",
    });
  }
});

router.put("/product/:id", async (req, res) => {
  try {
    const productUpdate = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (productUpdate) {
      res.status(201).json({
        success: true,
        updatedProduct: productUpdate,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Product cannot be updated",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Product update operation cannot be fulfilled",
    });
  }
});

module.exports = router;
