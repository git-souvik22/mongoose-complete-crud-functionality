const router = require("express").Router();
const Product = require("../models/product.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");
const redis = require("../redisClient.js");

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
  try {
    const redisproducts = await redis.get("products");
    const redisproductsbyCat = await redis.get("databyCat");

    if (redisproducts && redisproductsbyCat) {
      const products = JSON.parse(redisproducts);
      const productsbyCat = JSON.parse(redisproductsbyCat);
      res.status(200).json({
        success: true,
        products: products,
        databyCat: productsbyCat,
      });
    }
    if (!redisproducts && !redisproductsbyCat) {
      const databyCat = await Product.aggregate([
        { $group: { _id: "$category", details: { $push: "$$ROOT" } } },
      ]);
      const getAllProducts = await Product.find();

      if (getAllProducts && databyCat) {
        await redis.setex("products", 86400, JSON.stringify(getAllProducts));
        await redis.setex("databyCat", 86400, JSON.stringify(databyCat));
        res.status(200).json({
          success: true,
          products: getAllProducts,
          databyCat: databyCat,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "cannot get product details",
        });
      }
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
    const sellerID = req.user.id;
    const redisSellerProducts = await redis.get(sellerID);
    if (redisSellerProducts) {
      const sellerProducts = JSON.parse(redisSellerProducts);
      res.status(200).send({
        success: true,
        createdproducts: sellerProducts,
      });
    }
    if (!redisSellerProducts) {
      const allproducts = await Product.find({ sid: sellerID });
      if (allproducts) {
        await redis.setex(sellerID, 86400, JSON.stringify(allproducts));
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
    }
  } catch (err) {
    res.status(500).json({
      message: "Cannot fetch products data",
    });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const productID = req.params.id;
    const redisProduct = await redis.get(productID);
    if (redisProduct) {
      const specificproduct = JSON.parse(redisProduct);
      res.status(200).send({
        success: true,
        result: specificproduct,
      });
    }
    if (!redisProduct) {
      const getOneProduct = await Product.findById(productID);
      if (getOneProduct) {
        await redis.setex(productID, 86400, JSON.stringify(getOneProduct));
        res.status(200).json({
          success: true,
          result: getOneProduct,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Product cannot get",
        });
      }
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
    const productid = req.params.id;
    const productFound = await Product.findById({ _id: productid });
    productFound.images.map((image) => {
      fs.unlink(`${path.join(__dirname, "../" + image)}`, (err) => {
        if (err) throw err;
        // console.log(`${image} was deleted`);
      });
    });

    const productUpdate = await Product.findByIdAndUpdate(
      productid,
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
      await redis.setex(productid, 86400, JSON.stringify(productUpdate));
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
