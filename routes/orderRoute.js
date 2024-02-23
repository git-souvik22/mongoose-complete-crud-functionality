const router = require("express").Router();
const { requireLogin } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user.js");

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_SECRET_KEY;

let instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

router.post("/create-order", requireLogin, async (req, res) => {
  let { amount } = req.body;
  const customer = await User.findById({ _id: req.user.id });
  var options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "order_rcptid_11",
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

  console.log("gen_signature", generated_signature);
  console.log("cli_signature", signature);

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

module.exports = router;
