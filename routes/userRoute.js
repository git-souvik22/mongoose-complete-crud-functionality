const router = require("express").Router();
const User = require("../models/user.js");

//for admin
router.get("/user", async (req, res) => {
  try {
    const getUsers = await User.find().sort({ date: -1 });
    if (getUsers) {
      res.status(200).send({
        success: true,
        message: "Users data successfully fetched",
        result: getUsers,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Users data cannot be fetched",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Cannot get users data",
    });
  }
});

router.post("/create-user", async (req, res) => {
  try {
    if (req.body.password === req.body.cpassword) {
      const createUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        state: req.body.state,
        cityvill: req.body.cityvill,
        pin: req.body.pin,
        nearloc: req.body.nearloc,
        isAdmin: req.body.isAdmin,
      });
      const newUser = await createUser.save();
      res.status(201).send({
        success: true,
        message: "User Successfully created",
        result: newUser,
      });
    } else {
      res.status(401).send({
        success: false,
        message: "Password field doesn't match",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Something went wrong: ${err}`,
    });
  }
});

router.put("/user/:id", async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (updateUser) {
      res.status(201).send({
        success: true,
        message: "User successfully updated",
        result: updateUser,
      });
    } else {
      res.status(500).send({
        success: false,
        message: "User cannot be updated",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Something went wrong ${err}`,
    });
  }
});

module.exports = router;
