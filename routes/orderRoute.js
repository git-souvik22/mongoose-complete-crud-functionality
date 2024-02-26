const router = require("express").Router();
const { requireLogin } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");
const Razorpay = require("razorpay");
const receipt = require("otp-generator");
const crypto = require("crypto");
const User = require("../models/user.js");
const Product = require("../models/product.js");
const twilio = require("twilio");

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
      // console.log(order);
      res.send({
        status: true,
        order,
        customer,
      });
    }
  });
});
router.post("/verify-payment", requireLogin, async (req, res) => {
  let {
    payment_id,
    order_id,
    signature,
    pid,
    size,
    quantity,
    pay,
    product,
    receipt,
    phone,
  } = req.body;

  let payDetails = order_id + "|" + payment_id;
  let generated_signature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(payDetails.toString())
    .digest("hex");

  // console.log("gen_signature", generated_signature);
  // console.log("cli_signature", signature);
  const accountSid = process.env.TWILIO_ACC_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const VirtualMob = process.env.TWILIO_VMOB;
  const twilioClient = new twilio(accountSid, authToken);

  if (generated_signature == signature) {
    const order = new Order({
      pid: pid,
      cid: req.user.id,
      size: size,
      quantity: quantity,
      pay: pay,
      tid: receipt,
    });

    const savedOrder = await order.save();
    await twilioClient.messages.create({
      from: VirtualMob,
      body: `Placed: Chalkduster Order for ${product} is placed & will be delivered soon. (Transaction ID: ${receipt} )`,
      to: phone,
    });
    if (savedOrder) {
      res.send({
        status: true,
        message: "Payment Done",
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
    const orderPID = userOrders.map((item) => item.pid);

    const products = await Product.find({ _id: orderPID });

    //console.log(orderPID);
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
