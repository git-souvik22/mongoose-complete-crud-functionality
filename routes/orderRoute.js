const router = require("express").Router();
const { requireLogin } = require("../middlewares/userAuth.js");
const Order = require("../models/order.js");

router.post("/place-order", requireLogin, async (req, res) => {
  try {
    const { oid, size, quantity, cid, pay } = req.body;

    const createOrder = new Order({
      oid: oid,
      size: size,
      quantity: quantity,
      cid: cid,
      pay: pay,
    });
    const saveOrder = await createOrder.save();
    if (saveOrder) {
      res.status(201).send({
        success: true,
        order: saveOrder,
      });
    } else {
      res.status(401).send({
        success: false,
        message: "Order not saved",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
    });
  }
});

// router.post("/start-payment", )

module.exports = router;
