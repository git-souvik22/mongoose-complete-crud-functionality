const router = require("express").Router();
const Product = require("../models/product.js");
const auth = require("../auth/authRoutes.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");
const redis = require("../redisClient.js");

// redis
//   .set("name", "Souvik Roy")
//   .then(() => {
//     console.log("Name value was successfully set");
//   })
//   .catch((err) => {
//     console.log("Value could not be set", err);
//   });
redis.get("name", (err, data) => {
  if (err) {
    console.log("Error retreiving data" + err);
  }
  console.log("name value is:" + data);
});

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

router.put("/product/:id", upload.array("images", 4), async (req, res) => {
  try {
    const filePaths = req.files.map((file) => file.path);
    const updatedProduct = req.body;
    const productFound = await Product.findById({ _id: req.params.id });
    productFound.images.map((image) => {
      fs.unlink(`${path.join(__dirname, "../" + image)}`, (err) => {
        if (err) throw err;
        // console.log(`${image} was deleted`);
      });
    });

    const productUpdate = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: updatedProduct.name,
        images: filePaths,
        desc: updatedProduct.desc,
        price: updatedProduct.price,
        category: updatedProduct.category,
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

// get unpublished products
router.get(
  "/unpublished-products",
  requireLogin,
  adminAccess,
  async (req, res) => {
    try {
      const unProducts = await Product.find({ pState: "unpublish" });
      if (unProducts) {
        res.status(200).json({
          success: true,
          unProducts,
        });
      } else {
        res.status(200).json({
          success: false,
          message: "No Unpublished products found!",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);

// publish products
router.put(
  "/publish-product/:code",
  requireLogin,
  adminAccess,
  async (req, res) => {
    try {
      const publishProduct = await Product.findByIdAndUpdate(
        { _id: req.params.code },
        {
          pState: "published",
        },
        {
          new: true,
        }
      );
      if (publishProduct) {
        res.status(201).json({
          success: true,
          message: `${publishProduct._id} is published Successfully`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Product cannot be published",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Something Went Wrong",
      });
    }
  }
);

module.exports = router;
