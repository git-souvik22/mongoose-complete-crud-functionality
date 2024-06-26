const router = require("express").Router();
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");
const Razorpay = require("razorpay");
const receipt = require("otp-generator");
const crypto = require("crypto");
const User = require("../models/user.js");
const Product = require("../models/product.js");
const twilio = require("twilio");
const { returnOrderValid } = require("../middlewares/returnOrderValidate.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../src/.env") });

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
      body: `Placed: Chalkduster Order for ${product.slice(
        0,
        23
      )} is placed & will be delivered soon. (Transaction ID: ${receipt} )`,
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
// order cancellation
router.put("/cancel-order", requireLogin, async (req, res) => {
  try {
    const foundOrder = await Order.findOne({ tid: req.query.id });
    if (foundOrder.delState !== "delivered" && foundOrder.cid === req.user.id) {
      const cancelledOrder = await Order.findOneAndUpdate(
        { tid: foundOrder.tid },
        {
          delState: "cancelled",
          refund: "refund",
        },
        { new: true }
      );
      res.status(201).send({
        success: true,
        order: cancelledOrder,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "BAD REQUEST",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
});
//order return
router.put("/return-order", requireLogin, async (req, res) => {
  try {
    const foundOrder = await Order.findOne({ tid: req.query.id });
    if (foundOrder.delState === "delivered" && foundOrder.cid === req.user.id) {
      const returnValidityExpired = await returnOrderValid(foundOrder.time);
      if (returnValidityExpired) {
        res.status(404).send({
          success: false,
          message: "Return period for this Order was over",
        });
      }
      if (!returnValidityExpired) {
        const returnedOrder = await Order.findOneAndUpdate(
          { tid: foundOrder.tid },
          {
            delState: "return",
            refund: "refund",
          },
          { new: true }
        );
        res.status(201).send({
          success: true,
          order: returnedOrder,
        });
      }
    } else {
      res.status(404).send({
        success: false,
        message: "BAD REQUEST",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
});
// managed orders by Admin
router.get(
  "/manage-orders-globally",
  requireLogin,
  adminAccess,
  async (req, res) => {
    try {
      const OrdersToBeManaged = await Order.aggregate([
        { $match: { refund: "refund" } },
      ]);
      const refundOrderPID = OrdersToBeManaged.map((item) => item.pid);
      const refundProducts = await Product.find({ _id: refundOrderPID });
      const placedOrders = await Order.aggregate([
        {
          $match: {
            delState: { $in: ["placed", "shipped", "outfordelivery"] },
          },
        },
      ]);
      const placedOrderPID = placedOrders.map((item) => item.pid);
      const placedProducts = await Product.find({ _id: placedOrderPID });

      //console.log(OrdersToBeManaged);
      if (OrdersToBeManaged || placedOrders) {
        res.status(200).send({
          success: true,
          placed: placedOrders,
          placedProducts: placedProducts,
          refunds: OrdersToBeManaged,
          refundProducts: refundProducts,
        });
      }
      if (!OrdersToBeManaged || !placedOrders) {
        res.status(200).send({
          success: false,
          message: "No Order's under process",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);

//order act by Admin
router.put("/action-order", requireLogin, adminAccess, async (req, res) => {
  try {
    const targetOrder = req.query.id;
    const Action = req.query.action;
    if (Action === "ship") {
      const shipOrder = await Order.findOneAndUpdate(
        { tid: targetOrder },
        {
          delState: "shipped",
        },
        { new: true }
      );
      res.status(201).send({
        success: true,
        message: `${shipOrder.tid} has been ${shipOrder.delState} now`,
      });
    }
    if (Action === "outfordel") {
      const outDelOrder = await Order.findOneAndUpdate(
        { tid: targetOrder },
        {
          delState: "outfordelivery",
        },
        { new: true }
      );
      res.status(201).send({
        success: true,
        message: `${outDelOrder.tid} is ${outDelOrder.delState} now`,
      });
    }
    if (Action === "deliver") {
      const delOrder = await Order.findOneAndUpdate(
        { tid: targetOrder },
        {
          delState: "delivered",
        },
        { new: true }
      );
      res.status(201).send({
        success: true,
        message: `${delOrder.tid} is ${delOrder.delState} now`,
      });
    }
    if (Action === "refund") {
      const refundedOrder = await Order.findOneAndUpdate(
        { tid: targetOrder },
        {
          refund: "refunded",
        },
        { new: true }
      );
      res.status(201).send({
        success: true,
        message: `${refundedOrder.tid} has been ${refundedOrder.refund} now`,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
});

module.exports = router;
