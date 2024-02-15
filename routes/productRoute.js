const router = require("express").Router();
const Product = require("../models/product.js");
const auth = require("../auth/authRoutes.js");
const multer = require("multer");
const path = require("path");
const { requireLogin } = require("../middlewares/userAuth.js");

// initializing multer for uploading product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error("Only JPG, JPEG, and PNG files are allowed"), false);
  }
  cb(null, true);
};

// creating instance of multer middleware
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 80 * 1024 },
});

// uploading multiple image files using the instance of multer middleware
router.post(
  "/create-product",
  upload.array("images", 4),
  requireLogin,
  async (req, res) => {
    try {
      const filePaths = req.files.map((file) => file.path);
      const newProduct = req.body;
      const createProduct = new Product({
        name: newProduct.name,
        images: filePaths,
        category: newProduct.category,
        price: newProduct.price,
        desc: newProduct.desc,
        sid: req.user.id,
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
  }
);

router.get("/product", async (req, res) => {
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

// get products for specific seller
router.get("/thisSellerProducts", requireLogin, async (req, res) => {
  try {
    const allproducts = await Product.find({ sid: req.user.id });
    if (allproducts) {
      res.status(200).json({
        success: true,
        createdproducts: allproducts,
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
