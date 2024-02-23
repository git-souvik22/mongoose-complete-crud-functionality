const router = require("express").Router();
const { requireLogin } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_SECRET_KEY;

let instance = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

router.post("/create-order", requireLogin, async (req, res) => {
  let { amount } = req.body;
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
      });
    }
  });
});
router.post("/verify-payment", async (req, res) => {
  let { payment_id, order_id, signature } = req.body;

  let payDetails = order_id + "|" + payment_id;
  let generated_signature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(payDetails.toString())
    .digest("hex");

  console.log("gen_signature", generated_signature);
  console.log("cli_signature", signature);

  if (generated_signature == signature) {
    res.send({
      status: true,
      message: "Payment Done",
    });
  } else {
    res.status(500).send({
      status: false,
      message: "Payment Fail",
    });
  }
});

module.exports = router;
