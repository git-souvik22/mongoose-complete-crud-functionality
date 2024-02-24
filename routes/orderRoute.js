const router = require("express").Router();
const { requireLogin } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");
const Razorpay = require("razorpay");
const receipt = require("otp-generator");
const crypto = require("crypto");
const User = require("../models/user.js");
const Product = require("../models/product.js");

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_SECRET_KEY;

let instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

router.post("/create-order", requireLogin, async (req, res) => {
  let { amount } = req.body;
  const customer = await User.findById({ _id: req.user.id });

  const gen_receipt = receipt.generate(16, {
    upperCaseAlphabets: false,
  });

  var options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `${gen_receipt}`,
  };

  instance.orders.create(options, function (err, order) {
    if (err) {
      res.status(500).send({
        status: false,
        message: "unable to create a order",
      });
    } else {
      res.send({
        status: true,
        order,
        customer,
      });
    }
  });
});
router.post("/verify-payment", requireLogin, async (req, res) => {
  let { payment_id, order_id, signature, pid, size, quantity, pay } = req.body;

  let payDetails = order_id + "|" + payment_id;
  let generated_signature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(payDetails.toString())
    .digest("hex");

  // console.log("gen_signature", generated_signature);
  // console.log("cli_signature", signature);

  if (generated_signature == signature) {
    const order = new Order({
      pid: pid,
      cid: req.user.id,
      size: size,
      quantity: quantity,
      pay: pay,
    });
    const savedOrder = await order.save();
    if (savedOrder) {
      res.send({
        status: true,
        message: "Payment Done and Order was successfully saved",
      });
    }
  } else {
    res.status(500).send({
      status: false,
      message: "Payment Fail",
    });
  }
});

router.get("/orders", requireLogin, async (req, res) => {
  try {
    const userOrders = await Order.find({ cid: req.user.id });
    const products = await Product.find({
      _id: userOrders.map((item) => item.pid),
    });
    console.log(products);
    if (userOrders) {
      res.status(200).send({
        success: true,
        products: products,
        orders: userOrders,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "BAD REQUEST",
    });
  }
});

module.exports = router;
